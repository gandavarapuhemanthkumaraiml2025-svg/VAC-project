"""
RootWise Advisory Rule Engine.
Deterministic, explainable, source-backed decision logic.

Decision categories:
  WATER_NOW  — evidence supports watering
  CHECK_SOIL — insufficient or stale evidence to decide
  WAIT       — evidence supports deferring watering

Each decision includes rule IDs, evidence quality, warnings, and source refs.
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Tuple, Dict, Any

from app.schemas.schemas import (
    AdvisoryRequest, DecisionLabel, EvidenceQuality,
    MoistureMeasurementType, QualitativeMoisture, GrowthStage,
)
from app.services.plant_data import PLANT_PROFILES, RULES

logger = logging.getLogger(__name__)

# ── Constants (configurable thresholds — documented) ─────────────────────────
STALE_OBSERVATION_HOURS = 24          # Observations older than this are stale
SIGNIFICANT_RAINFALL_MM = 5.0         # mm in last 24h considered significant
HIGH_FORECAST_RAIN_MM = 10.0          # mm forecast considered high
HIGH_FORECAST_PROB = 70.0             # % probability considered high
HIGH_TEMP_C = 35.0                    # Heat stress threshold (general)

# Aloe-specific qualitative thresholds
ALOE_WAIT_QUALITATIVE = {QualitativeMoisture.WET, QualitativeMoisture.MOIST}
ALOE_WATER_QUALITATIVE = {QualitativeMoisture.DRY}

# General plant qualitative thresholds
GENERAL_WAIT_QUALITATIVE = {QualitativeMoisture.WET}
GENERAL_WATER_QUALITATIVE = {QualitativeMoisture.DRY}
GENERAL_ADEQUATE_QUALITATIVE = {QualitativeMoisture.MOIST, QualitativeMoisture.SLIGHTLY_MOIST}


def _get_plant_profile(plant_id: str) -> Optional[Dict[str, Any]]:
    """Return the plant profile dict for a given ID."""
    for p in PLANT_PROFILES:
        if p["id"] == plant_id:
            return p
    return None


def _get_rule(rule_id: str) -> Optional[Dict[str, Any]]:
    """Return a rule dict by ID."""
    for r in RULES:
        if r["id"] == rule_id:
            return r
    return None


def _is_stale(observed_at: Optional[datetime]) -> bool:
    """Return True if the observation is older than STALE_OBSERVATION_HOURS."""
    if observed_at is None:
        return False  # Missing, not stale
    if observed_at.tzinfo is None:
        observed_at = observed_at.replace(tzinfo=timezone.utc)
    age = datetime.now(timezone.utc) - observed_at
    return age > timedelta(hours=STALE_OBSERVATION_HOURS)


def _qualitative_from_percentage(pct: float, plant_id: str) -> QualitativeMoisture:
    """
    Map percentage moisture to a qualitative label using plant-specific thresholds.
    This is a rough approximation — soil type and sensor calibration affect readings.
    """
    profile = _get_plant_profile(plant_id)
    if not profile:
        return QualitativeMoisture.SLIGHTLY_MOIST

    guidance = profile.get("moisture_guidance", {}).get("percentage_guidance", {})
    low = guidance.get("low_threshold_pct", 30)
    high = guidance.get("high_threshold_pct", 80)
    adequate_range = guidance.get("adequate_range_pct", [40, 70])

    if pct <= low:
        return QualitativeMoisture.DRY
    elif pct >= high:
        return QualitativeMoisture.WET
    elif pct >= adequate_range[1]:
        return QualitativeMoisture.MOIST
    else:
        return QualitativeMoisture.SLIGHTLY_MOIST


class AdvisoryResult:
    """Holds intermediate rule evaluation state."""
    def __init__(self):
        self.decision: DecisionLabel = DecisionLabel.CHECK_SOIL
        self.recommendation: str = ""
        self.explanation: str = ""
        self.evidence_quality: EvidenceQuality = EvidenceQuality.INSUFFICIENT
        self.rule_ids: List[str] = []
        self.source_ids: List[str] = []
        self.missing_inputs: List[str] = []
        self.warnings: List[str] = []
        self.suggested_next_action: str = "Check soil moisture manually before watering."


def evaluate_advisory(
    request: AdvisoryRequest,
    weather: Optional[Any] = None,  # WeatherResponse or None
) -> AdvisoryResult:
    """
    Main entry point for the rule engine.
    Evaluates inputs step by step and returns an AdvisoryResult.
    """
    result = AdvisoryResult()

    # ── STEP 1: Validate plant profile ────────────────────────────────────────
    profile = _get_plant_profile(request.plant_id)
    if profile is None:
        result.decision = DecisionLabel.CHECK_SOIL
        result.recommendation = "Unsupported plant type selected."
        result.explanation = (
            f"Plant ID '{request.plant_id}' is not in the supported profile database. "
            "Please select a supported plant (tomato, basil, or aloe_vera)."
        )
        result.evidence_quality = EvidenceQuality.INSUFFICIENT
        result.missing_inputs.append("valid_plant_profile")
        result.suggested_next_action = "Select a supported plant profile and resubmit."
        return result

    # ── STEP 2: Assess moisture evidence quality ───────────────────────────────
    moisture_type = request.moisture_type
    has_moisture = False
    is_stale = False
    effective_qualitative: Optional[QualitativeMoisture] = None
    pct_value: Optional[float] = None

    if moisture_type == MoistureMeasurementType.QUALITATIVE:
        if request.moisture_qualitative is None:
            result.missing_inputs.append("moisture_qualitative")
        else:
            has_moisture = True
            effective_qualitative = request.moisture_qualitative

    elif moisture_type == MoistureMeasurementType.PERCENTAGE:
        if request.moisture_value is None:
            result.missing_inputs.append("moisture_value")
        else:
            pct_value = request.moisture_value
            if pct_value < 0 or pct_value > 100:
                result.warnings.append(
                    f"Moisture percentage {pct_value}% is outside the valid 0–100 range."
                )
                result.decision = DecisionLabel.CHECK_SOIL
                result.recommendation = "Invalid moisture percentage provided."
                result.explanation = (
                    f"The value {pct_value}% is outside the valid 0–100 range for volumetric "
                    "water content percentage. Please provide a valid reading."
                )
                result.evidence_quality = EvidenceQuality.INSUFFICIENT
                result.missing_inputs.append("valid_moisture_value")
                result.suggested_next_action = "Enter a moisture percentage between 0 and 100."
                return result

            has_moisture = True
            effective_qualitative = _qualitative_from_percentage(pct_value, request.plant_id)
            result.warnings.append(
                f"Percentage reading ({pct_value}%) mapped to '{effective_qualitative.value}' "
                "using plant-specific thresholds. Actual soil condition depends on sensor "
                "calibration and soil type."
            )

    # Check staleness
    if has_moisture and request.moisture_observed_at:
        is_stale = _is_stale(request.moisture_observed_at)
        if is_stale:
            result.warnings.append(
                f"Soil moisture observation is more than {STALE_OBSERVATION_HOURS} hours old. "
                "Current soil condition may differ significantly."
            )

    # ── STEP 3: Missing moisture → CHECK_SOIL (RULE_GEN01) ───────────────────
    if not has_moisture:
        rule = _get_rule("RULE_GEN01")
        result.decision = DecisionLabel.CHECK_SOIL
        result.recommendation = "Please check the soil moisture before watering."
        result.explanation = rule["explanation_template"] if rule else (
            "No soil moisture observation provided. Cannot make a reliable watering recommendation."
        )
        result.evidence_quality = EvidenceQuality.INSUFFICIENT
        result.rule_ids.append("RULE_GEN01")
        result.suggested_next_action = (
            "Push a finger 3–5 cm into the soil, or use a moisture meter. "
            "Record the result and resubmit."
        )
        return result

    # ── STEP 4: Stale moisture → CHECK_SOIL (RULE_GEN02) ─────────────────────
    if is_stale:
        rule = _get_rule("RULE_GEN02")
        result.decision = DecisionLabel.CHECK_SOIL
        result.recommendation = "Your moisture observation is stale — please take a fresh reading."
        result.explanation = rule["explanation_template"] if rule else (
            "The moisture reading is older than 24 hours and may no longer reflect current conditions."
        )
        result.evidence_quality = EvidenceQuality.WEAK
        result.rule_ids.append("RULE_GEN02")
        result.suggested_next_action = (
            "Take a fresh soil moisture reading and resubmit the advisory request."
        )
        return result

    # ── STEP 5: Plant-specific rules ──────────────────────────────────────────
    plant_id = request.plant_id
    growth_stage = request.growth_stage
    moisture_guidance = profile.get("moisture_guidance", {})
    avoid_qualitative = set(moisture_guidance.get("avoid_qualitative", []))
    preferred = moisture_guidance.get("preferred_qualitative", "moist")

    triggered_rules: List[Dict] = []

    if plant_id == "aloe_vera":
        if effective_qualitative in ALOE_WAIT_QUALITATIVE:
            r = _get_rule("RULE_A01")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})
        elif effective_qualitative in ALOE_WATER_QUALITATIVE:
            r = _get_rule("RULE_A02")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WATER_NOW})
        if pct_value is not None and pct_value > 35:
            r = _get_rule("RULE_A03")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})

    elif plant_id == "basil":
        if effective_qualitative == QualitativeMoisture.WET:
            r = _get_rule("RULE_B01")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})
        elif effective_qualitative == QualitativeMoisture.DRY:
            r = _get_rule("RULE_B02")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WATER_NOW})
        if pct_value is not None and pct_value > 70:
            r = _get_rule("RULE_B03")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})

    elif plant_id == "tomato":
        if effective_qualitative == QualitativeMoisture.WET:
            r = _get_rule("RULE_T02")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})
        elif effective_qualitative == QualitativeMoisture.DRY:
            r = _get_rule("RULE_T01")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WATER_NOW})
        if pct_value is not None:
            if pct_value < 30:
                r = _get_rule("RULE_T03")
                if r:
                    triggered_rules.append({"rule": r, "effect": DecisionLabel.WATER_NOW})
            elif pct_value > 80:
                r = _get_rule("RULE_T04")
                if r:
                    triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})

    # ── STEP 6: Weather modifiers ──────────────────────────────────────────────
    weather_note = None
    if weather and not weather.error:
        rain_24h = weather.rainfall_last_24h_mm or 0.0
        forecast_rain = weather.forecast_rainfall_mm or 0.0
        forecast_prob = weather.forecast_rain_probability_pct or 0.0
        temp_c = weather.temperature_c

        # Significant rainfall + adequate moisture → reinforce WAIT
        if (
            rain_24h >= SIGNIFICANT_RAINFALL_MM
            and effective_qualitative in {QualitativeMoisture.MOIST, QualitativeMoisture.SLIGHTLY_MOIST}
        ):
            r = _get_rule("RULE_W01")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})
                weather_note = (
                    f"Recent rainfall of {rain_24h:.1f} mm recorded at location. "
                    "Note: container soil may differ from outdoor rainfall data."
                )

        # High forecast rain + adequate moisture → reinforce WAIT
        if (
            forecast_rain >= HIGH_FORECAST_RAIN_MM
            and forecast_prob >= HIGH_FORECAST_PROB
            and effective_qualitative in {QualitativeMoisture.MOIST, QualitativeMoisture.SLIGHTLY_MOIST}
        ):
            r = _get_rule("RULE_W02")
            if r:
                triggered_rules.append({"rule": r, "effect": DecisionLabel.WAIT})
                weather_note = (
                    f"Forecast shows {forecast_rain:.1f} mm with {forecast_prob:.0f}% probability. "
                    "Container plants in covered areas may not receive this rain."
                )

        # Heat stress warning (high temp does not override soil evidence)
        if temp_c and temp_c >= HIGH_TEMP_C:
            result.warnings.append(
                f"High temperature ({temp_c:.1f}°C) detected. Soil may dry faster than usual. "
                "Check moisture more frequently. High temperature alone does not confirm watering is needed."
            )

        if weather.is_cached:
            result.warnings.append(
                f"Weather data is from cache (fetched at {weather.fetched_at.strftime('%Y-%m-%d %H:%M UTC')}). "
                "Use 'Refresh Weather' for the latest data."
            )
    elif weather and weather.error:
        result.warnings.append(
            f"Weather data unavailable: {weather.error} "
            "Advisory based on soil observation only."
        )

    # ── STEP 7: Resolve decision by priority ──────────────────────────────────
    # Precedence: WAIT rules outweigh WATER_NOW if moisture is not clearly deficient.
    # WATER_NOW wins only when the primary plant-specific rule fires without contradiction.
    wait_rules = [t for t in triggered_rules if t["effect"] == DecisionLabel.WAIT]
    water_rules = [t for t in triggered_rules if t["effect"] == DecisionLabel.WATER_NOW]

    for t in triggered_rules:
        result.rule_ids.append(t["rule"]["id"])
        for src in (t["rule"].get("source_ids") or []):
            if src not in result.source_ids:
                result.source_ids.append(src)

    if wait_rules and water_rules:
        # Conflicting evidence
        result.decision = DecisionLabel.CHECK_SOIL
        result.recommendation = "Conflicting soil and weather signals — please verify soil condition directly."
        result.explanation = (
            "The advisory engine found both reasons to water and reasons to wait. "
            "This may happen when a qualitative observation and a percentage reading disagree, "
            "or when recent rainfall and low soil moisture readings conflict. "
            "A direct visual or tactile soil check is the most reliable approach."
        )
        result.evidence_quality = EvidenceQuality.WEAK
        result.warnings.append("Conflicting rule signals detected. Manual verification recommended.")
        result.suggested_next_action = (
            "Inspect the soil manually at 5 cm depth. Update the reading and resubmit."
        )
    elif wait_rules:
        # Clearly wait
        primary = wait_rules[0]["rule"]
        result.decision = DecisionLabel.WAIT
        result.recommendation = _build_wait_recommendation(profile, effective_qualitative, growth_stage)
        result.explanation = primary["explanation_template"]
        result.evidence_quality = EvidenceQuality.STRONG if len(wait_rules) > 1 else EvidenceQuality.MODERATE
        result.suggested_next_action = (
            "Check soil again in 1–2 days. Water only when soil moisture has reduced to the appropriate level."
        )
    elif water_rules:
        # Water recommended
        primary = water_rules[0]["rule"]
        result.decision = DecisionLabel.WATER_NOW
        result.recommendation = _build_water_recommendation(profile, effective_qualitative, growth_stage)
        result.explanation = primary["explanation_template"]
        result.evidence_quality = EvidenceQuality.STRONG if has_moisture and not is_stale else EvidenceQuality.MODERATE
        result.suggested_next_action = (
            "Water until it drains from the bottom. Record the watering time. "
            "Check soil again before the next watering."
        )
    else:
        # Adequate moisture — no compelling reason either way
        result.decision = DecisionLabel.WAIT
        result.recommendation = _build_adequate_recommendation(profile, effective_qualitative, growth_stage)
        result.explanation = (
            f"Soil moisture appears to be in the adequate range for {profile['name']}. "
            "No urgent watering action is required based on the current reading."
        )
        result.evidence_quality = EvidenceQuality.MODERATE
        result.suggested_next_action = "Check soil again in 1–2 days."

    if weather_note:
        result.explanation += f" {weather_note}"

    # Drainage warning
    if not request.has_drainage and result.decision == DecisionLabel.WATER_NOW:
        result.warnings.append(
            "Container has no drainage. Overwatering risk is significantly higher. "
            "Use less water and check frequently."
        )

    return result


# ── Recommendation builders ───────────────────────────────────────────────────

def _build_water_recommendation(profile: Dict, qualitative: QualitativeMoisture, stage: GrowthStage) -> str:
    name = profile["name"]
    stage_info = next(
        (s for s in profile.get("growth_stages", []) if s.get("stage") == stage.value),
        None
    )
    freq_note = stage_info.get("watering_frequency", "") if stage_info else ""
    return (
        f"Water your {name} now. The soil is {qualitative.value.replace('_', ' ')}, "
        f"which is below the acceptable moisture level. "
        + (f"{freq_note}" if freq_note else "Water thoroughly until it drains from the bottom.")
    )


def _build_wait_recommendation(profile: Dict, qualitative: QualitativeMoisture, stage: GrowthStage) -> str:
    name = profile["name"]
    return (
        f"Do not water your {name} yet. The soil is {qualitative.value.replace('_', ' ')}, "
        "which indicates sufficient or excess moisture. "
        "Adding more water now risks waterlogging and root damage."
    )


def _build_adequate_recommendation(profile: Dict, qualitative: QualitativeMoisture, stage: GrowthStage) -> str:
    name = profile["name"]
    preferred = profile.get("moisture_guidance", {}).get("preferred_qualitative", "moist")
    return (
        f"Your {name} appears to have adequate moisture ({qualitative.value.replace('_', ' ')}). "
        f"Preferred level is '{preferred.replace('_', ' ')}'. "
        "No watering needed right now. Monitor and check again in 1–2 days."
    )
