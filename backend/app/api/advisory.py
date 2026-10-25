"""
Advisory API router — POST /api/advisory and GET /api/advisories/history
"""
import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.schemas import (
    AdvisoryRequest, AdvisoryResponse, AdvisoryHistoryItem,
    InputSummary, DecisionLabel, EvidenceQuality,
)
from app.models.advisory import Advisory
from app.models.plant import PlantProfile
from app.rules.advisory_engine import evaluate_advisory
from app.services.weather_client import fetch_weather, DEMO_WEATHER

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/advisory", tags=["advisory"])


@router.post("", response_model=AdvisoryResponse)
async def create_advisory(
    request: AdvisoryRequest,
    db: Session = Depends(get_db),
):
    """
    Evaluate a plant watering advisory.
    Validates inputs, retrieves weather, runs the rule engine, persists the result.
    """
    # Validate plant exists
    plant = db.query(PlantProfile).filter(PlantProfile.id == request.plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail=f"Plant '{request.plant_id}' not found.")

    # Get weather data
    weather = None
    is_demo = False
    if request.use_demo_weather:
        weather = DEMO_WEATHER
        is_demo = True
    elif request.latitude is not None and request.longitude is not None:
        weather = await fetch_weather(db, request.latitude, request.longitude, request.location_name)

    # Run rule engine
    result = evaluate_advisory(request, weather)

    # Build input snapshot
    input_snap = {
        "plant_id": request.plant_id,
        "growth_stage": request.growth_stage.value,
        "soil_type": request.soil_type.value,
        "pot_size": request.pot_size.value,
        "has_drainage": request.has_drainage,
        "light_exposure": request.light_exposure.value,
        "moisture_type": request.moisture_type.value,
        "moisture_value": request.moisture_value,
        "moisture_qualitative": request.moisture_qualitative.value if request.moisture_qualitative else None,
        "moisture_observed_at": request.moisture_observed_at.isoformat() if request.moisture_observed_at else None,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "last_watered_at": request.last_watered_at.isoformat() if request.last_watered_at else None,
        "notes": request.notes,
        "weather_temperature_c": weather.temperature_c if weather else None,
        "weather_rainfall_24h": weather.rainfall_last_24h_mm if weather else None,
        "weather_fetched_at": weather.fetched_at.isoformat() if weather else None,
    }

    # Persist advisory
    advisory = Advisory(
        plant_id=request.plant_id,
        created_at=datetime.now(timezone.utc),
        decision=result.decision.value,
        recommendation=result.recommendation,
        explanation=result.explanation,
        rule_ids=result.rule_ids,
        source_ids=result.source_ids,
        evidence_quality=result.evidence_quality.value,
        input_snapshot=input_snap,
        data_quality_warnings=result.warnings,
        missing_inputs=result.missing_inputs,
    )
    db.add(advisory)
    db.commit()
    db.refresh(advisory)

    # Build response
    inputs_summary = InputSummary(
        plant_id=request.plant_id,
        growth_stage=request.growth_stage.value,
        soil_type=request.soil_type.value,
        pot_size=request.pot_size.value,
        has_drainage=request.has_drainage,
        light_exposure=request.light_exposure.value,
        moisture_type=request.moisture_type.value,
        moisture_value=request.moisture_value,
        moisture_qualitative=request.moisture_qualitative.value if request.moisture_qualitative else None,
        moisture_observed_at=request.moisture_observed_at,
        temperature_c=weather.temperature_c if weather else None,
        rainfall_last_24h_mm=weather.rainfall_last_24h_mm if weather else None,
        forecast_rainfall_mm=weather.forecast_rainfall_mm if weather else None,
        forecast_rain_probability_pct=weather.forecast_rain_probability_pct if weather else None,
        weather_fetched_at=weather.fetched_at if weather else None,
        weather_provider=weather.provider if weather else None,
    )

    weather_note = None
    if weather and weather.error:
        weather_note = f"Weather unavailable: {weather.error}"
    elif is_demo:
        weather_note = "Demo weather data used — not from live API."
    elif weather and weather.is_cached:
        weather_note = f"Cached weather (fetched {weather.fetched_at.strftime('%H:%M UTC')})."

    return AdvisoryResponse(
        id=advisory.id,
        decision=result.decision,
        recommendation=result.recommendation,
        explanation=result.explanation,
        evidence_quality=result.evidence_quality,
        rule_ids=result.rule_ids,
        source_ids=result.source_ids,
        inputs_considered=inputs_summary,
        missing_inputs=result.missing_inputs,
        data_quality_warnings=result.warnings,
        suggested_next_action=result.suggested_next_action,
        created_at=advisory.created_at,
        weather_data_note=weather_note,
        is_demo_data=is_demo,
    )


@router.get("/history", response_model=List[AdvisoryHistoryItem])
def get_advisory_history(
    plant_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Return paginated advisory history."""
    q = db.query(Advisory)
    if plant_id:
        q = q.filter(Advisory.plant_id == plant_id)
    advisories = q.order_by(Advisory.created_at.desc()).offset(offset).limit(limit).all()
    return advisories
