"""SQLAlchemy models for Advisories."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.db import Base


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(String, ForeignKey("plant_profiles.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Decision
    decision = Column(String, nullable=False)  # WATER_NOW, CHECK_SOIL, WAIT
    recommendation = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    
    # Evidence
    rule_ids = Column(JSON, nullable=True)
    source_ids = Column(JSON, nullable=True)
    evidence_quality = Column(String, nullable=True)  # strong, moderate, weak, insufficient
    
    # Inputs snapshot
    input_snapshot = Column(JSON, nullable=False)
    
    # Warnings
    data_quality_warnings = Column(JSON, nullable=True)
    missing_inputs = Column(JSON, nullable=True)
    
    plant = relationship("PlantProfile", back_populates="advisories")
