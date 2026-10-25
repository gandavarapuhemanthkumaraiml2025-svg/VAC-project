"""SQLAlchemy models for Observations."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.db import Base


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(String, ForeignKey("plant_profiles.id"), nullable=True)
    measurement_type = Column(String, nullable=False)  # "percentage", "qualitative"
    measurement_value = Column(Float, nullable=True)  # numeric value when applicable
    measurement_unit = Column(String, nullable=True)  # "%", "raw_0_1023"
    qualitative_value = Column(String, nullable=True)  # "dry", "slightly_moist", "moist", "wet"
    observed_at = Column(DateTime, nullable=False)
    source_type = Column(String, default="manual")  # "manual", "sensor", "demo"
    quality_flag = Column(String, default="ok")  # "ok", "stale", "suspect", "missing"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    plant = relationship("PlantProfile", back_populates="observations")
