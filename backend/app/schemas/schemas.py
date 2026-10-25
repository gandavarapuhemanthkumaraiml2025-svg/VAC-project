"""
Pydantic schemas for RootWise API request/response validation.
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from enum import Enum


# ─── Enums ───────────────────────────────────────────────────────────────────

class DecisionLabel(str, Enum):
    WATER_NOW = "WATER_NOW"
    CHECK_SOIL = "CHECK_SOIL"
    WAIT = "WAIT"


class GrowthStage(str, Enum):
    SEEDLING = "seedling"
    VEGETATIVE = "vegetative"
    FLOWERING = "flowering"
    FRUITING = "fruiting"
    DORMANT = "dormant"
    MATURE = "mature"


class SoilType(str, Enum):
    POTTING_MIX = "potting_mix"
    CACTUS_MIX = "cactus_mix"
    LOAMY = "loamy"
    SANDY = "sandy"
    CLAY = "clay"
    PEAT = "peat"
    COCOPEAT = "cocopeat"
    GARDEN_SOIL = "garden_soil"


class PotSize(str, Enum):
    SMALL = "small"        # < 15 cm diameter
    MEDIUM = "medium"      # 15–25 cm diameter
    LARGE = "large"        # 25–40 cm diameter
    EXTRA_LARGE = "extra_large"  # > 40 cm


class LightExposure(str, Enum):
    FULL_SUN = "full_sun"
    PARTIAL_SUN = "partial_sun"
    SHADE = "shade"
    INDOOR_BRIGHT = "indoor_bright"
    INDOOR_LOW = "indoor_low"


class MoistureMeasurementType(str, Enum):
    PERCENTAGE = "percentage"        # 0–100% volumetric water content
    QUALITATIVE = "qualitative"      # human visual/tactile observation


class QualitativeMoisture(str, Enum):
    DRY = "dry"
    SLIGHTLY_MOIST = "slightly_moist"
    MOIST = "moist"
    WET = "wet"


class EvidenceQuality(str, Enum):
    STRONG = "strong"
    MODERATE = "moderate"
    WEAK = "weak"
    INSUFFICIENT = "insufficient"


# ─── Advisory Request ─────────────────────────────────────────────────────────

class AdvisoryRequest(BaseModel):
    # Plant info
    plant_id: str = Field(..., description="Plant profile ID (e.g., 'tomato')")
    growth_stage: GrowthStage = Field(GrowthStage.VEGETATIVE, description="Current growth stage")
    
    # Container info
    soil_type: SoilType = Field(SoilType.POTTING_MIX, description="Growing medium type")
    pot_size: PotSize = Field(PotSize.MEDIUM, description="Container size category")
    has_drainage: bool = Field(True, description="Whether pot has drainage holes")
    
    # Environment
    light_exposure: LightExposure = Field(LightExposure.PARTIAL_SUN)
    
    # Moisture measurement
    moisture_type: MoistureMeasurementType = Field(MoistureMeasurementType.QUALITATIVE)
    moisture_value: Optional[float] = Field(None, ge=0, le=100, description="Moisture percentage (0–100)")
    moisture_qualitative: Optional[QualitativeMoisture] = Field(None)
    moisture_observed_at: Optional[datetime] = Field(None, description="When moisture was measured (UTC)")
    
    # Location for weather
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    location_name: Optional[str] = Field(None, max_length=100)
    
    # Optional context
    last_watered_at: Optional[datetime] = Field(None)
    notes: Optional[str] = Field(None, max_length=500)
    
    # Demo mode
    use_demo_weather: bool = Field(False, description="Use demo weather instead of live API")

    @field_validator("moisture_value")
    @classmethod
    def validate_moisture_value(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("Moisture percentage must be between 0 and 100")
        return v

    @model_validator(mode="after")
    def validate_moisture_fields(self):
        if self.moisture_type == MoistureMeasurementType.PERCENTAGE:
            if self.moisture_value is None:
                raise ValueError("moisture_value is required when moisture_type is 'percentage'")
        elif self.moisture_type == MoistureMeasurementType.QUALITATIVE:
            if self.moisture_qualitative is None:
                raise ValueError("moisture_qualitative is required when moisture_type is 'qualitative'")
        return self

    @model_validator(mode="after")
    def validate_location(self):
        if self.latitude is not None and self.longitude is None:
            raise ValueError("longitude is required when latitude is provided")
        if self.longitude is not None and self.latitude is None:
            raise ValueError("latitude is required when longitude is provided")
        return self


# ─── Advisory Response ────────────────────────────────────────────────────────

class InputSummary(BaseModel):
    plant_id: str
    growth_stage: str
    soil_type: str
    pot_size: str
    has_drainage: bool
    light_exposure: str
    moisture_type: str
    moisture_value: Optional[float]
    moisture_qualitative: Optional[str]
    moisture_observed_at: Optional[datetime]
    temperature_c: Optional[float]
    rainfall_last_24h_mm: Optional[float]
    forecast_rainfall_mm: Optional[float]
    forecast_rain_probability_pct: Optional[float]
    weather_fetched_at: Optional[datetime]
    weather_provider: Optional[str]


class AdvisoryResponse(BaseModel):
    id: int
    decision: DecisionLabel
    recommendation: str
    explanation: str
    evidence_quality: EvidenceQuality
    rule_ids: List[str]
    source_ids: List[str]
    inputs_considered: InputSummary
    missing_inputs: List[str]
    data_quality_warnings: List[str]
    suggested_next_action: str
    created_at: datetime
    weather_data_note: Optional[str] = None
    is_demo_data: bool = False


# ─── Weather Schemas ──────────────────────────────────────────────────────────

class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: Optional[str] = Field(None, max_length=100)


class WeatherResponse(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str]
    temperature_c: Optional[float]
    apparent_temperature_c: Optional[float]
    relative_humidity_pct: Optional[float]
    wind_speed_kmh: Optional[float]
    weather_code: Optional[int]
    weather_description: Optional[str]
    is_day: Optional[bool]
    rainfall_last_24h_mm: Optional[float]
    rainfall_last_1h_mm: Optional[float]
    forecast_rainfall_mm: Optional[float]
    forecast_rain_probability_pct: Optional[float]
    forecast_period_hours: int
    fetched_at: datetime
    is_cached: bool
    cache_expires_at: Optional[datetime]
    provider: str
    attribution: str = "Weather data by Open-Meteo (https://open-meteo.com) — CC BY 4.0"
    error: Optional[str] = None


# ─── Plant Schemas ────────────────────────────────────────────────────────────

class PlantProfileResponse(BaseModel):
    id: str
    name: str
    scientific_name: Optional[str]
    profile_description: str
    care_difficulty: str
    moisture_guidance: Dict[str, Any]
    growth_stages: List[Dict[str, Any]]
    soil_preferences: Optional[Dict[str, Any]]
    environmental_factors: Optional[Dict[str, Any]]
    source_ids: Optional[List[str]]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Observation Schemas ──────────────────────────────────────────────────────

class ObservationCreate(BaseModel):
    plant_id: Optional[str] = None
    measurement_type: MoistureMeasurementType
    measurement_value: Optional[float] = Field(None, ge=0, le=100)
    measurement_unit: Optional[str] = None
    qualitative_value: Optional[QualitativeMoisture] = None
    observed_at: datetime
    source_type: Literal["manual", "sensor", "demo"] = "manual"
    notes: Optional[str] = Field(None, max_length=500)


class ObservationResponse(BaseModel):
    id: int
    plant_id: Optional[str]
    measurement_type: str
    measurement_value: Optional[float]
    measurement_unit: Optional[str]
    qualitative_value: Optional[str]
    observed_at: datetime
    source_type: str
    quality_flag: str
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── History Schemas ──────────────────────────────────────────────────────────

class AdvisoryHistoryItem(BaseModel):
    id: int
    plant_id: Optional[str]
    decision: str
    recommendation: str
    evidence_quality: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Source Schema ────────────────────────────────────────────────────────────

class SourceResponse(BaseModel):
    id: str
    title: str
    url: str
    publisher: Optional[str]
    access_date: Optional[str]
    relevant_guidance: Optional[str]
    covered_plants: Optional[List[str]]
    covered_rules: Optional[List[str]]
    scope_and_limitations: Optional[str]
    licence: Optional[str]
    source_type: str

    model_config = {"from_attributes": True}


# ─── Dataset Summary ──────────────────────────────────────────────────────────

class DatasetSummaryResponse(BaseModel):
    total_records: int
    column_count: int
    columns: List[str]
    plant_distribution: Dict[str, int]
    advisory_label_distribution: Dict[str, int]
    missing_value_counts: Dict[str, int]
    duplicate_count: int
    data_origin_distribution: Dict[str, int]
    numerical_stats: Dict[str, Dict[str, float]]
    quality_flag_distribution: Dict[str, int]
    data_note: str


# ─── Health Check ─────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    weather_provider: str
    timestamp: datetime
