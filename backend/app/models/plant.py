"""SQLAlchemy models for RootWise."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.db import Base


class PlantProfile(Base):
    __tablename__ = "plant_profiles"

    id = Column(String, primary_key=True)  # e.g., "tomato", "basil", "aloe_vera"
    name = Column(String, nullable=False)
    scientific_name = Column(String, nullable=True)
    profile_description = Column(Text, nullable=False)
    care_difficulty = Column(String, default="moderate")  # easy, moderate, hard
    moisture_guidance = Column(JSON, nullable=False)  # structured guidance object
    growth_stages = Column(JSON, nullable=False)  # list of stages with guidance
    soil_preferences = Column(JSON, nullable=True)
    environmental_factors = Column(JSON, nullable=True)
    source_ids = Column(JSON, nullable=True)  # list of source IDs
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    observations = relationship("Observation", back_populates="plant")
    advisories = relationship("Advisory", back_populates="plant")
