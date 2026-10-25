"""
RootWise End-to-End System Verification Script.
Tests DB seeding, rule engine logic, and mock advisory synthesis.
"""
import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

def main():
    print("=" * 60)
    print("ROOTWISE CAPSTONE SYSTEM VERIFICATION")
    print("=" * 60)

    try:
        from app.database.db import init_db, SessionLocal
        from app.services.seed_service import seed_database
        from app.rules.advisory_engine import evaluate_advisory
        from app.schemas.schemas import (
            AdvisoryRequest, WeatherResponse, GrowthStage, SoilType,
            PotSize, LightExposure, MoistureMeasurementType, QualitativeMoisture
        )
        from datetime import datetime, timezone

        print("[1/4] Initializing SQLite database...")
        init_db()
        db = SessionLocal()
        seed_database(db)
        print("      -> Database initialized and botanical seeds loaded.")

        print("[2/4] Testing Weather Data parsing...")
        mock_weather = WeatherResponse(
            latitude=12.97,
            longitude=77.59,
            location_name="Bangalore Test Station",
            temperature_c=28.5,
            apparent_temperature_c=29.0,
            relative_humidity_pct=60.0,
            wind_speed_kmh=12.0,
            weather_code=0,
            weather_description="Clear Sky",
            is_day=True,
            rainfall_last_24h_mm=0.0,
            rainfall_last_1h_mm=0.0,
            forecast_rainfall_mm=0.0,
            forecast_rain_probability_pct=5.0,
            forecast_period_hours=24,
            fetched_at=datetime.now(timezone.utc),
            is_cached=True,
            cache_expires_at=None,
            provider="open-meteo-mock",
            attribution="Open-Meteo Verification Mock",
            error=None
        )
        print("      -> Mock weather structure validated.")

        print("[3/4] Running Advisory Synthesis for Dry Tomato...")
        req = AdvisoryRequest(
            plant_id="tomato",
            growth_stage=GrowthStage.VEGETATIVE,
            soil_type=SoilType.POTTING_MIX,
            pot_size=PotSize.MEDIUM,
            has_drainage=True,
            light_exposure=LightExposure.FULL_SUN,
            moisture_type=MoistureMeasurementType.QUALITATIVE,
            moisture_qualitative=QualitativeMoisture.DRY,
            latitude=12.97,
            longitude=77.59,
        )

        res = evaluate_advisory(req, mock_weather)
        print(f"      -> Decision: {res.decision}")
        print(f"      -> Recommendation: {res.recommendation}")
        print(f"      -> Evidence Quality: {res.evidence_quality}")
        print(f"      -> Rules Triggered: {res.rule_ids}")
        assert res.decision.value == "WATER_NOW", f"Expected WATER_NOW, got {res.decision}"

        print("[4/4] Running Edge-Case: Slightly moist soil with imminent 15mm forecast rain...")
        req_rain = req.model_copy(update={
            "moisture_qualitative": QualitativeMoisture.SLIGHTLY_MOIST
        })
        rain_weather = mock_weather.model_copy(update={
            "forecast_rainfall_mm": 15.0,
            "forecast_rain_probability_pct": 85.0
        })
        res_rain = evaluate_advisory(req_rain, rain_weather)
        print(f"      -> Decision with imminent rain: {res_rain.decision}")
        print(f"      -> Rules Triggered: {res_rain.rule_ids}")
        assert res_rain.decision.value == "WAIT", f"Expected WAIT due to rain preemption, got {res_rain.decision}"

        print("\nAll Core Verifications PASSED successfully! [SUCCESS]")
        return 0

    except Exception as e:
        print(f"\n[ERROR] Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    sys.exit(main())
