"""
Observations API router — POST /api/observations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database.db import get_db
from app.models.observation import Observation
from app.models.plant import PlantProfile
from app.schemas.schemas import ObservationCreate, ObservationResponse, MoistureMeasurementType

router = APIRouter(prefix="/api/observations", tags=["observations"])


@router.post("", response_model=ObservationResponse, status_code=201)
def create_observation(
    obs: ObservationCreate,
    db: Session = Depends(get_db),
):
    """Store a validated plant moisture observation."""
    if obs.plant_id:
        plant = db.query(PlantProfile).filter(PlantProfile.id == obs.plant_id).first()
        if not plant:
            raise HTTPException(status_code=404, detail=f"Plant '{obs.plant_id}' not found.")

    if obs.measurement_type == MoistureMeasurementType.PERCENTAGE and obs.measurement_value is None:
        raise HTTPException(status_code=422, detail="measurement_value required for percentage type.")

    if obs.measurement_type == MoistureMeasurementType.QUALITATIVE and obs.qualitative_value is None:
        raise HTTPException(status_code=422, detail="qualitative_value required for qualitative type.")

    observation = Observation(
        plant_id=obs.plant_id,
        measurement_type=obs.measurement_type.value,
        measurement_value=obs.measurement_value,
        measurement_unit=obs.measurement_unit or ("%" if obs.measurement_type == MoistureMeasurementType.PERCENTAGE else None),
        qualitative_value=obs.qualitative_value.value if obs.qualitative_value else None,
        observed_at=obs.observed_at,
        source_type=obs.source_type,
        quality_flag="ok",
        notes=obs.notes,
        created_at=datetime.now(timezone.utc),
    )
    db.add(observation)
    db.commit()
    db.refresh(observation)
    return observation


@router.get("", response_model=List[ObservationResponse])
def list_observations(
    plant_id: str = None,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Return recent observations, optionally filtered by plant."""
    q = db.query(Observation)
    if plant_id:
        q = q.filter(Observation.plant_id == plant_id)
    return q.order_by(Observation.observed_at.desc()).limit(limit).all()
