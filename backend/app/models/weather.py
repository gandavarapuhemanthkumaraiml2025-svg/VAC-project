"""SQLAlchemy models for Weather Snapshots."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from datetime import datetime, timezone
from app.database.db import Base


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=True)
    fetched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Current conditions
    temperature_c = Column(Float, nullable=True)
    apparent_temperature_c = Column(Float, nullable=True)
    relative_humidity_pct = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)
    weather_code = Column(Integer, nullable=True)
    weather_description = Column(String, nullable=True)
    is_day = Column(Boolean, nullable=True)
    
    # Precipitation
    rainfall_last_24h_mm = Column(Float, nullable=True)
    rainfall_last_1h_mm = Column(Float, nullable=True)
    
    # Forecast (next 24h)
    forecast_rainfall_mm = Column(Float, nullable=True)
    forecast_rain_probability_pct = Column(Float, nullable=True)
    forecast_period_hours = Column(Integer, default=24)
    
    # Metadata
    timezone_str = Column(String, nullable=True)
    provider = Column(String, default="open-meteo")
    raw_response = Column(JSON, nullable=True)
    is_cached = Column(Boolean, default=False)
    cache_expires_at = Column(DateTime, nullable=True)
