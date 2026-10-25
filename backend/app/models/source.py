"""SQLAlchemy models for Sources and Rules."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from datetime import datetime, timezone
from app.database.db import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    publisher = Column(String, nullable=True)
    access_date = Column(String, nullable=True)  # ISO date string
    relevant_guidance = Column(Text, nullable=True)
    covered_plants = Column(JSON, nullable=True)  # list of plant IDs
    covered_rules = Column(JSON, nullable=True)   # list of rule IDs
    scope_and_limitations = Column(Text, nullable=True)
    licence = Column(String, nullable=True)
    source_type = Column(String, default="horticulture")  # horticulture, weather, dataset
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Rule(Base):
    __tablename__ = "rules"

    id = Column(String, primary_key=True)
    version = Column(String, default="1.0")
    plant_scope = Column(JSON, nullable=True)  # list of plant IDs, or null for all
    condition_description = Column(Text, nullable=False)
    decision_effect = Column(String, nullable=False)  # WATER_NOW, CHECK_SOIL, WAIT
    priority = Column(Integer, default=5)  # 1 = highest
    explanation_template = Column(Text, nullable=False)
    source_ids = Column(JSON, nullable=True)
    limitations = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
