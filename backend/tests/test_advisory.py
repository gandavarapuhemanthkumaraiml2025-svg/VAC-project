"""
Backend pytest tests for the RootWise advisory engine and API endpoints.
Tests all 20 edge-case scenarios documented in the capstone spec.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

# ── Engine unit tests ─────────────────────────────────────────────────────────
from app.schemas.schemas import (
    AdvisoryRequest, GrowthStage, SoilType, PotSize,
    LightExposure, MoistureMeasurementType, QualitativeMoisture,
    DecisionLabel,
)
from app.rules.advisory_engine import evaluate_advisory


def _base_request(**kwargs) -> AdvisoryRequest:
    defaults = dict(
        plant_id="tomato",
        growth_stage=GrowthStage.VEGETATIVE,
        soil_type=SoilType.POTTING_MIX,
        pot_size=PotSize.MEDIUM,
        has_drainage=True,
        light_exposure=LightExposure.FULL_SUN,
        moisture_type=MoistureMeasurementType.QUALITATIVE,
        moisture_qualitative=QualitativeMoisture.MOIST,
        moisture_observed_at=datetime.now(timezone.utc),
        latitude=None,
        longitude=None,
        use_demo_weather=False,
    )
    defaults.update(kwargs)
    return AdvisoryRequest(**defaults)


# ── Test 1: Dry soil with valid tomato profile ─────────────────────────────────
def test_TC01_dry_soil_tomato_water_now():
    req = _base_request(moisture_qualitative=QualitativeMoisture.DRY)
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WATER_NOW
    assert "RULE_T01" in result.rule_ids


# ── Test 2: Moist soil — no need to water ────────────────────────────────────
def test_TC02_moist_soil_wait():
    req = _base_request(moisture_qualitative=QualitativeMoisture.MOIST)
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WAIT


# ── Test 3: Wet soil — wait, overwatering risk ───────────────────────────────
def test_TC03_wet_soil_wait():
    req = _base_request(moisture_qualitative=QualitativeMoisture.WET)
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WAIT
    assert "RULE_T02" in result.rule_ids


# ── Test 4: Missing moisture observation → CHECK_SOIL ────────────────────────
def test_TC04_missing_moisture_check_soil():
    req = AdvisoryRequest.model_construct(
        plant_id="tomato",
        growth_stage=GrowthStage.VEGETATIVE,
        soil_type=SoilType.POTTING_MIX,
        pot_size=PotSize.MEDIUM,
        has_drainage=True,
        light_exposure=LightExposure.FULL_SUN,
        moisture_type=MoistureMeasurementType.QUALITATIVE,
        moisture_qualitative=None,
        moisture_value=None,
        moisture_observed_at=None,
        latitude=None,
        longitude=None,
        use_demo_weather=False,
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.CHECK_SOIL
    assert "RULE_GEN01" in result.rule_ids


# ── Test 5: Stale observation > 24h → CHECK_SOIL ─────────────────────────────
def test_TC05_stale_observation_check_soil():
    stale_time = datetime.now(timezone.utc) - timedelta(hours=26)
    req = _base_request(
        moisture_qualitative=QualitativeMoisture.MOIST,
        moisture_observed_at=stale_time,
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.CHECK_SOIL
    assert "RULE_GEN02" in result.rule_ids


# ── Test 6: Invalid negative percentage ──────────────────────────────────────
def test_TC06_invalid_negative_percentage():
    with pytest.raises(Exception):
        AdvisoryRequest(
            plant_id="tomato",
            growth_stage=GrowthStage.VEGETATIVE,
            soil_type=SoilType.POTTING_MIX,
            pot_size=PotSize.MEDIUM,
            has_drainage=True,
            light_exposure=LightExposure.FULL_SUN,
            moisture_type=MoistureMeasurementType.PERCENTAGE,
            moisture_value=-5.0,
            moisture_observed_at=datetime.now(timezone.utc),
        )


# ── Test 7: Percentage > 100 ─────────────────────────────────────────────────
def test_TC07_percentage_over_100():
    with pytest.raises(Exception):
        AdvisoryRequest(
            plant_id="tomato",
            growth_stage=GrowthStage.VEGETATIVE,
            soil_type=SoilType.POTTING_MIX,
            pot_size=PotSize.MEDIUM,
            has_drainage=True,
            light_exposure=LightExposure.FULL_SUN,
            moisture_type=MoistureMeasurementType.PERCENTAGE,
            moisture_value=150.0,
            moisture_observed_at=datetime.now(timezone.utc),
        )


# ── Test 8: Unknown plant ID ─────────────────────────────────────────────────
def test_TC08_unknown_plant_check_soil():
    req = _base_request(plant_id="dragon_fruit")
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.CHECK_SOIL
    assert "valid_plant_profile" in result.missing_inputs


# ── Test 9: Aloe — moist soil → wait ─────────────────────────────────────────
def test_TC09_aloe_moist_wait():
    req = _base_request(
        plant_id="aloe_vera",
        soil_type=SoilType.CACTUS_MIX,
        moisture_qualitative=QualitativeMoisture.MOIST,
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WAIT
    assert "RULE_A01" in result.rule_ids


# ── Test 10: Aloe — dry soil → water ─────────────────────────────────────────
def test_TC10_aloe_dry_water_now():
    req = _base_request(
        plant_id="aloe_vera",
        soil_type=SoilType.CACTUS_MIX,
        moisture_qualitative=QualitativeMoisture.DRY,
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WATER_NOW
    assert "RULE_A02" in result.rule_ids


# ── Test 11: Basil — wet soil → wait ────────────────────────────────────────
def test_TC11_basil_wet_wait():
    req = _base_request(
        plant_id="basil",
        moisture_qualitative=QualitativeMoisture.WET,
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WAIT
    assert "RULE_B01" in result.rule_ids


# ── Test 12: Basil — dry soil → water ───────────────────────────────────────
def test_TC12_basil_dry_water_now():
    req = _base_request(
        plant_id="basil",
        moisture_qualitative=QualitativeMoisture.DRY,
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WATER_NOW
    assert "RULE_B02" in result.rule_ids


# ── Test 13: Low percentage maps to dry for tomato ───────────────────────────
def test_TC13_low_percentage_tomato():
    req = _base_request(
        moisture_type=MoistureMeasurementType.PERCENTAGE,
        moisture_value=20.0,
        moisture_qualitative=None,
        moisture_observed_at=datetime.now(timezone.utc),
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WATER_NOW


# ── Test 14: High percentage for tomato → wait ───────────────────────────────
def test_TC14_high_percentage_tomato():
    req = _base_request(
        moisture_type=MoistureMeasurementType.PERCENTAGE,
        moisture_value=85.0,
        moisture_qualitative=None,
        moisture_observed_at=datetime.now(timezone.utc),
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WAIT


# ── Test 15: No drainage warning when WATER_NOW ──────────────────────────────
def test_TC15_no_drainage_warning():
    req = _base_request(
        has_drainage=False,
        moisture_qualitative=QualitativeMoisture.DRY,
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WATER_NOW
    assert any("drainage" in w.lower() for w in result.warnings)


# ── Test 16: Repeated identical inputs → same decision ───────────────────────
def test_TC16_deterministic_same_input():
    req1 = _base_request(moisture_qualitative=QualitativeMoisture.DRY)
    req2 = _base_request(moisture_qualitative=QualitativeMoisture.DRY)
    r1 = evaluate_advisory(req1)
    r2 = evaluate_advisory(req2)
    assert r1.decision == r2.decision
    assert r1.rule_ids == r2.rule_ids


# ── Test 17: Weather unavailable → advisory still works ──────────────────────
def test_TC17_no_weather_advisory_works():
    req = _base_request(moisture_qualitative=QualitativeMoisture.DRY)
    result = evaluate_advisory(req, weather=None)
    assert result.decision == DecisionLabel.WATER_NOW


# ── Test 18: Weather API error → warning in result ───────────────────────────
def test_TC18_weather_error_warning():
    from app.schemas.schemas import WeatherResponse
    from datetime import datetime, timezone
    bad_weather = WeatherResponse(
        latitude=13.0, longitude=80.0, location_name=None,
        temperature_c=None, apparent_temperature_c=None,
        relative_humidity_pct=None, wind_speed_kmh=None,
        weather_code=None, weather_description=None, is_day=None,
        rainfall_last_24h_mm=None, rainfall_last_1h_mm=None,
        forecast_rainfall_mm=None, forecast_rain_probability_pct=None,
        forecast_period_hours=24,
        fetched_at=datetime.now(timezone.utc),
        is_cached=False, cache_expires_at=None,
        provider="open-meteo",
        error="Connection timeout",
    )
    req = _base_request(moisture_qualitative=QualitativeMoisture.DRY)
    result = evaluate_advisory(req, weather=bad_weather)
    assert result.decision == DecisionLabel.WATER_NOW
    assert any("unavailable" in w.lower() for w in result.warnings)


# ── Test 19: High temp warning added but doesn't override soil evidence ───────
def test_TC19_high_temp_warning_not_override():
    from app.schemas.schemas import WeatherResponse
    hot_weather = WeatherResponse(
        latitude=13.0, longitude=80.0, location_name=None,
        temperature_c=38.0, apparent_temperature_c=42.0,
        relative_humidity_pct=60.0, wind_speed_kmh=10.0,
        weather_code=0, weather_description="Clear sky", is_day=True,
        rainfall_last_24h_mm=0.0, rainfall_last_1h_mm=0.0,
        forecast_rainfall_mm=0.0, forecast_rain_probability_pct=5.0,
        forecast_period_hours=24,
        fetched_at=datetime.now(timezone.utc),
        is_cached=False, cache_expires_at=None,
        provider="open-meteo", error=None,
    )
    req = _base_request(moisture_qualitative=QualitativeMoisture.MOIST)
    result = evaluate_advisory(req, weather=hot_weather)
    # High temp alone should not override moist soil → still WAIT
    assert result.decision == DecisionLabel.WAIT
    assert any("35" in w or "high temp" in w.lower() or "temperature" in w.lower() for w in result.warnings)


# ── Test 20: Aloe percentage high → wait ────────────────────────────────────
def test_TC20_aloe_high_percentage_wait():
    req = _base_request(
        plant_id="aloe_vera",
        soil_type=SoilType.CACTUS_MIX,
        moisture_type=MoistureMeasurementType.PERCENTAGE,
        moisture_value=45.0,
        moisture_qualitative=None,
        moisture_observed_at=datetime.now(timezone.utc),
    )
    result = evaluate_advisory(req)
    assert result.decision == DecisionLabel.WAIT
    assert "RULE_A03" in result.rule_ids


# ── API integration tests ─────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def client():
    import os
    os.environ["DATABASE_URL"] = "sqlite:///./test_rootwise.db"
    from app.main import app
    with TestClient(app) as c:
        yield c
    # Cleanup
    import os
    try:
        from app.database.db import engine
        engine.dispose()
        if os.path.exists("test_rootwise.db"):
            os.remove("test_rootwise.db")
    except Exception:
        pass


def test_api_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_api_plants_list(client):
    resp = client.get("/api/plants")
    assert resp.status_code == 200
    plants = resp.json()
    assert len(plants) == 3
    ids = [p["id"] for p in plants]
    assert "tomato" in ids
    assert "basil" in ids
    assert "aloe_vera" in ids


def test_api_plant_by_id(client):
    resp = client.get("/api/plants/tomato")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Tomato"


def test_api_plant_not_found(client):
    resp = client.get("/api/plants/cactus")
    assert resp.status_code == 404


def test_api_advisory_water_now(client):
    payload = {
        "plant_id": "tomato",
        "growth_stage": "vegetative",
        "soil_type": "potting_mix",
        "pot_size": "medium",
        "has_drainage": True,
        "light_exposure": "full_sun",
        "moisture_type": "qualitative",
        "moisture_qualitative": "dry",
        "moisture_observed_at": datetime.now(timezone.utc).isoformat(),
        "use_demo_weather": False,
    }
    resp = client.post("/api/advisory", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] == "WATER_NOW"


def test_api_advisory_invalid_plant(client):
    payload = {
        "plant_id": "unknown_plant",
        "growth_stage": "vegetative",
        "soil_type": "potting_mix",
        "pot_size": "medium",
        "has_drainage": True,
        "light_exposure": "full_sun",
        "moisture_type": "qualitative",
        "moisture_qualitative": "dry",
        "moisture_observed_at": datetime.now(timezone.utc).isoformat(),
    }
    resp = client.post("/api/advisory", json=payload)
    assert resp.status_code == 404


def test_api_sources(client):
    resp = client.get("/api/sources")
    assert resp.status_code == 200
    assert len(resp.json()) > 0


def test_api_history(client):
    resp = client.get("/api/advisory/history")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
