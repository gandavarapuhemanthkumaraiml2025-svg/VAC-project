"""
Plants API router — GET /api/plants and GET /api/plants/{plant_id}
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.db import get_db
from app.models.plant import PlantProfile
from app.schemas.schemas import PlantProfileResponse

router = APIRouter(prefix="/api/plants", tags=["plants"])


@router.get("", response_model=List[PlantProfileResponse])
def list_plants(db: Session = Depends(get_db)):
    """Return all supported plant profiles."""
    plants = db.query(PlantProfile).order_by(PlantProfile.name).all()
    return plants


@router.get("/{plant_id}", response_model=PlantProfileResponse)
def get_plant(plant_id: str, db: Session = Depends(get_db)):
    """Return a single plant profile with full details."""
    plant = db.query(PlantProfile).filter(PlantProfile.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail=f"Plant '{plant_id}' not found.")
    return plant
