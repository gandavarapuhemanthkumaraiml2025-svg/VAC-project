"""
Weather client for Open-Meteo API.
Handles retrieval, caching, validation, and error handling.
Open-Meteo is free and requires no API key.
Attribution: Weather data by Open-Meteo (https://open-meteo.com) — CC BY 4.0
"""
import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.weather import WeatherSnapshot
from app.schemas.schemas import WeatherResponse

logger = logging.getLogger(__name__)

OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"

WMO_DESCRIPTIONS = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
}

DEMO_WEATHER = WeatherResponse(
    latitude=13.0827,
    longitude=80.2707,
    location_name="Chennai (Demo)",
    temperature_c=31.5,
    apparent_temperature_c=36.2,
    relative_humidity_pct=72.0,
    wind_speed_kmh=14.0,
    weather_code=2,
    weather_description="Partly cloudy",
    is_day=True,
    rainfall_last_24h_mm=0.0,
    rainfall_last_1h_mm=0.0,
    forecast_rainfall_mm=2.5,
    forecast_rain_probability_pct=25.0,
    forecast_period_hours=24,
    fetched_at=datetime.now(timezone.utc),
    is_cached=False,
    cache_expires_at=None,
    provider="open-meteo-demo",
    attribution="Demo weather data — not from live API",
    error=None,
)


def _get_cached_snapshot(db: Session, lat: float, lon: float) -> Optional[WeatherSnapshot]:
    """Return a valid cached snapshot if one exists."""
    now = datetime.now(timezone.utc)
    snap = (
        db.query(WeatherSnapshot)
        .filter(
            WeatherSnapshot.latitude.between(lat - 0.01, lat + 0.01),
            WeatherSnapshot.longitude.between(lon - 0.01, lon + 0.01),
            WeatherSnapshot.cache_expires_at > now,
        )
        .order_by(WeatherSnapshot.fetched_at.desc())
        .first()
    )
    return snap


def _snapshot_to_response(snap: WeatherSnapshot, is_cached: bool = True) -> WeatherResponse:
    return WeatherResponse(
        latitude=snap.latitude,
        longitude=snap.longitude,
        location_name=snap.location_name,
        temperature_c=snap.temperature_c,
        apparent_temperature_c=snap.apparent_temperature_c,
        relative_humidity_pct=snap.relative_humidity_pct,
        wind_speed_kmh=snap.wind_speed_kmh,
        weather_code=snap.weather_code,
        weather_description=snap.weather_description,
        is_day=snap.is_day,
        rainfall_last_24h_mm=snap.rainfall_last_24h_mm,
        rainfall_last_1h_mm=snap.rainfall_last_1h_mm,
        forecast_rainfall_mm=snap.forecast_rainfall_mm,
        forecast_rain_probability_pct=snap.forecast_rain_probability_pct,
        forecast_period_hours=snap.forecast_period_hours or 24,
        fetched_at=snap.fetched_at,
        is_cached=is_cached,
        cache_expires_at=snap.cache_expires_at,
        provider=snap.provider,
    )


async def fetch_weather(
    db: Session,
    latitude: float,
    longitude: float,
    location_name: Optional[str] = None,
    force_refresh: bool = False,
) -> WeatherResponse:
    """
    Fetch weather for the given coordinates.
    Returns a cached response if available and not force-refreshed.
    Falls back gracefully on API errors.
    """
    # Check cache first
    if not force_refresh:
        cached = _get_cached_snapshot(db, latitude, longitude)
        if cached:
            logger.info("Returning cached weather for %.4f, %.4f", latitude, longitude)
            return _snapshot_to_response(cached, is_cached=True)

    # Build request parameters for Open-Meteo
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "wind_speed_10m",
            "weather_code",
            "is_day",
            "rain",
            "precipitation",
        ],
        "hourly": ["precipitation_probability", "precipitation"],
        "daily": ["precipitation_sum", "precipitation_probability_max"],
        "forecast_days": 2,
        "timezone": "auto",
        "timeformat": "iso8601",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.weather_request_timeout_seconds) as client:
            resp = await client.get(OPEN_METEO_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException:
        logger.warning("Weather API timeout for %.4f, %.4f", latitude, longitude)
        return _error_response(latitude, longitude, location_name, "Weather API request timed out.")
    except httpx.HTTPStatusError as e:
        logger.warning("Weather API HTTP error %s", e.response.status_code)
        return _error_response(latitude, longitude, location_name, f"Weather API returned HTTP {e.response.status_code}.")
    except Exception as e:
        logger.error("Weather API unexpected error: %s", str(e))
        return _error_response(latitude, longitude, location_name, "Weather API unavailable.")

    # Parse response
    try:
        current = data.get("current", {})
        daily = data.get("daily", {})
        hourly = data.get("hourly", {})

        temperature_c = current.get("temperature_2m")
        apparent_temperature_c = current.get("apparent_temperature")
        relative_humidity_pct = current.get("relative_humidity_2m")
        wind_speed_kmh = current.get("wind_speed_10m")
        weather_code = current.get("weather_code")
        is_day = bool(current.get("is_day", 1))
        rain_1h = current.get("rain") or current.get("precipitation")

        weather_description = WMO_DESCRIPTIONS.get(weather_code, "Unknown")

        # Precipitation last 24h: sum today's daily value
        daily_precip = daily.get("precipitation_sum", [])
        rainfall_24h = daily_precip[0] if daily_precip else None

        # Forecast: next day's sum and probability
        forecast_rainfall = daily_precip[1] if len(daily_precip) > 1 else None
        daily_prob = daily.get("precipitation_probability_max", [])
        forecast_prob = daily_prob[1] if len(daily_prob) > 1 else None

        timezone_str = data.get("timezone")
        now = datetime.now(timezone.utc)
        expires = now + timedelta(seconds=settings.weather_cache_ttl_seconds)

        # Persist snapshot
        snap = WeatherSnapshot(
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            fetched_at=now,
            temperature_c=temperature_c,
            apparent_temperature_c=apparent_temperature_c,
            relative_humidity_pct=relative_humidity_pct,
            wind_speed_kmh=wind_speed_kmh,
            weather_code=weather_code,
            weather_description=weather_description,
            is_day=is_day,
            rainfall_last_24h_mm=rainfall_24h,
            rainfall_last_1h_mm=rain_1h,
            forecast_rainfall_mm=forecast_rainfall,
            forecast_rain_probability_pct=forecast_prob,
            forecast_period_hours=24,
            timezone_str=timezone_str,
            provider="open-meteo",
            raw_response=data,
            is_cached=False,
            cache_expires_at=expires,
        )
        db.add(snap)
        db.commit()
        db.refresh(snap)

        return _snapshot_to_response(snap, is_cached=False)

    except Exception as e:
        logger.error("Error parsing weather response: %s", str(e))
        return _error_response(latitude, longitude, location_name, "Failed to parse weather data.")


def _error_response(lat: float, lon: float, name: Optional[str], error: str) -> WeatherResponse:
    return WeatherResponse(
        latitude=lat,
        longitude=lon,
        location_name=name,
        temperature_c=None,
        apparent_temperature_c=None,
        relative_humidity_pct=None,
        wind_speed_kmh=None,
        weather_code=None,
        weather_description=None,
        is_day=None,
        rainfall_last_24h_mm=None,
        rainfall_last_1h_mm=None,
        forecast_rainfall_mm=None,
        forecast_rain_probability_pct=None,
        forecast_period_hours=24,
        fetched_at=datetime.now(timezone.utc),
        is_cached=False,
        cache_expires_at=None,
        provider="open-meteo",
        error=error,
    )
