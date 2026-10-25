"""
Weather API router — GET /api/weather
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.db import get_db
from app.schemas.schemas import WeatherResponse
from app.services.weather_client import fetch_weather, DEMO_WEATHER

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("", response_model=WeatherResponse)
async def get_weather(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    location_name: Optional[str] = Query(None, max_length=100),
    force_refresh: bool = Query(False),
    demo: bool = Query(False, description="Return demo weather data"),
    db: Session = Depends(get_db),
):
    """
    Retrieve current weather and 24h forecast for the given coordinates.
    Returns cached data when available. Use force_refresh=true to bypass cache.
    Attribution: Weather data by Open-Meteo (https://open-meteo.com) — CC BY 4.0
    """
    if demo:
        return DEMO_WEATHER
    return await fetch_weather(db, latitude, longitude, location_name, force_refresh)
