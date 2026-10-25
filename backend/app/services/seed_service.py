"""
Seed service: populates the database with initial plant profiles, sources, and rules.
"""
import logging
from sqlalchemy.orm import Session
from app.models.plant import PlantProfile
from app.models.source import Source, Rule
from app.services.plant_data import PLANT_PROFILES, SOURCES, RULES

logger = logging.getLogger(__name__)


def seed_database(db: Session) -> None:
    """Seed the database with initial data if not already present."""
    _seed_plants(db)
    _seed_sources(db)
    _seed_rules(db)
    logger.info("Database seeding complete.")


def _seed_plants(db: Session) -> None:
    for profile_data in PLANT_PROFILES:
        existing = db.query(PlantProfile).filter(PlantProfile.id == profile_data["id"]).first()
        if not existing:
            from datetime import datetime, timezone
            plant = PlantProfile(
                id=profile_data["id"],
                name=profile_data["name"],
                scientific_name=profile_data.get("scientific_name"),
                profile_description=profile_data["profile_description"],
                care_difficulty=profile_data.get("care_difficulty", "moderate"),
                moisture_guidance=profile_data["moisture_guidance"],
                growth_stages=profile_data["growth_stages"],
                soil_preferences=profile_data.get("soil_preferences"),
                environmental_factors=profile_data.get("environmental_factors"),
                source_ids=profile_data.get("source_ids"),
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(plant)
            logger.info("Seeded plant: %s", profile_data["name"])
    db.commit()


def _seed_sources(db: Session) -> None:
    for src_data in SOURCES:
        existing = db.query(Source).filter(Source.id == src_data["id"]).first()
        if not existing:
            source = Source(**src_data)
            db.add(source)
            logger.info("Seeded source: %s", src_data["id"])
    db.commit()


def _seed_rules(db: Session) -> None:
    for rule_data in RULES:
        existing = db.query(Rule).filter(Rule.id == rule_data["id"]).first()
        if not existing:
            rule = Rule(**rule_data)
            db.add(rule)
            logger.info("Seeded rule: %s", rule_data["id"])
    db.commit()
