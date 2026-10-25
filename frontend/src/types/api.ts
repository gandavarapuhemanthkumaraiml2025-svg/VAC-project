// ── API types mirroring backend Pydantic schemas ─────────────────────────────

export type DecisionLabel = 'WATER_NOW' | 'CHECK_SOIL' | 'WAIT';
export type EvidenceQuality = 'strong' | 'moderate' | 'weak' | 'insufficient';
export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'dormant' | 'mature';
export type SoilType = 'potting_mix' | 'cactus_mix' | 'loamy' | 'sandy' | 'clay' | 'peat' | 'cocopeat' | 'garden_soil';
export type PotSize = 'small' | 'medium' | 'large' | 'extra_large';
export type LightExposure = 'full_sun' | 'partial_sun' | 'shade' | 'indoor_bright' | 'indoor_low';
export type MoistureMeasurementType = 'percentage' | 'qualitative';
export type QualitativeMoisture = 'dry' | 'slightly_moist' | 'moist' | 'wet';

export interface PlantProfile {
  id: string;
  name: string;
  scientific_name: string | null;
  profile_description: string;
  care_difficulty: 'easy' | 'moderate' | 'hard';
  moisture_guidance: {
    summary: string;
    preferred_qualitative: string;
    acceptable_qualitative: string[];
    avoid_qualitative: string[];
    percentage_guidance?: {
      note: string;
      low_threshold_pct: number;
      adequate_range_pct: [number, number];
      high_threshold_pct: number;
    };
    watering_frequency_note: string;
    signs_of_underwatering: string[];
    signs_of_overwatering: string[];
  };
  growth_stages: Array<{
    stage: string;
    label: string;
    moisture_note: string;
    watering_frequency: string;
    caution: string | null;
  }>;
  soil_preferences: {
    recommended: string[];
    acceptable: string[];
    avoid: string[];
    notes: string;
  } | null;
  environmental_factors: Record<string, unknown> | null;
  source_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  location_name: string | null;
  temperature_c: number | null;
  apparent_temperature_c: number | null;
  relative_humidity_pct: number | null;
  wind_speed_kmh: number | null;
  weather_code: number | null;
  weather_description: string | null;
  is_day: boolean | null;
  rainfall_last_24h_mm: number | null;
  rainfall_last_1h_mm: number | null;
  forecast_rainfall_mm: number | null;
  forecast_rain_probability_pct: number | null;
  forecast_period_hours: number;
  fetched_at: string;
  is_cached: boolean;
  cache_expires_at: string | null;
  provider: string;
  attribution: string;
  error: string | null;
}

export interface AdvisoryRequest {
  plant_id: string;
  growth_stage: GrowthStage;
  soil_type: SoilType;
  pot_size: PotSize;
  has_drainage: boolean;
  light_exposure: LightExposure;
  moisture_type: MoistureMeasurementType;
  moisture_value?: number;
  moisture_qualitative?: QualitativeMoisture;
  moisture_observed_at?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  last_watered_at?: string;
  notes?: string;
  use_demo_weather?: boolean;
}

export interface InputSummary {
  plant_id: string;
  growth_stage: string;
  soil_type: string;
  pot_size: string;
  has_drainage: boolean;
  light_exposure: string;
  moisture_type: string;
  moisture_value: number | null;
  moisture_qualitative: string | null;
  moisture_observed_at: string | null;
  temperature_c: number | null;
  rainfall_last_24h_mm: number | null;
  forecast_rainfall_mm: number | null;
  forecast_rain_probability_pct: number | null;
  weather_fetched_at: string | null;
  weather_provider: string | null;
}

export interface AdvisoryResponse {
  id: number;
  decision: DecisionLabel;
  recommendation: string;
  explanation: string;
  evidence_quality: EvidenceQuality;
  rule_ids: string[];
  source_ids: string[];
  inputs_considered: InputSummary;
  missing_inputs: string[];
  data_quality_warnings: string[];
  suggested_next_action: string;
  created_at: string;
  weather_data_note: string | null;
  is_demo_data: boolean;
}

export interface AdvisoryHistoryItem {
  id: number;
  plant_id: string | null;
  decision: DecisionLabel;
  recommendation: string;
  evidence_quality: string | null;
  created_at: string;
}

export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  publisher: string | null;
  access_date: string | null;
  relevant_guidance: string | null;
  covered_plants: string[] | null;
  covered_rules: string[] | null;
  scope_and_limitations: string | null;
  licence: string | null;
  source_type: string;
}

export interface DatasetSummary {
  total_records: number;
  column_count: number;
  columns: string[];
  plant_distribution: Record<string, number>;
  advisory_label_distribution: Record<string, number>;
  missing_value_counts: Record<string, number>;
  duplicate_count: number;
  data_origin_distribution: Record<string, number>;
  numerical_stats: Record<string, Record<string, number>>;
  quality_flag_distribution: Record<string, number>;
  data_note: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  database: string;
  weather_provider: string;
  timestamp: string;
}

export interface ObservationCreate {
  plant_id?: string;
  measurement_type: MoistureMeasurementType;
  measurement_value?: number;
  measurement_unit?: string;
  qualitative_value?: QualitativeMoisture;
  observed_at: string;
  source_type: 'manual' | 'sensor' | 'demo';
  notes?: string;
}
