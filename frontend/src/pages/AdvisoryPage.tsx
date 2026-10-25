import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Droplets,
  Sprout,
  Sun,
  CloudRain,
  Sliders,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import type {
  PlantProfile,
  AdvisoryRequest,
  AdvisoryResponse,
  GrowthStage,
  SoilType,
  PotSize,
  LightExposure,
  QualitativeMoisture,
  MoistureMeasurementType
} from '../types/api';
import { AdvisoryResultCard } from '../components/AdvisoryResultCard';

const PRESET_SCENARIOS = [
  {
    name: 'Rain Imminent (Outdoor Tomato)',
    description: 'Soil is dry, but 12mm rain forecast within 12 hours. Advisory should defer.',
    data: {
      plant_id: 'tomato',
      growth_stage: 'vegetative' as GrowthStage,
      soil_type: 'loamy' as SoilType,
      pot_size: 'large' as PotSize,
      has_drainage: true,
      light_exposure: 'full_sun' as LightExposure,
      moisture_type: 'qualitative' as MoistureMeasurementType,
      moisture_qualitative: 'dry' as QualitativeMoisture,
      latitude: 12.97,
      longitude: 77.59,
      location_name: 'Bangalore (Rain Scenario)',
      use_demo_weather: true,
    },
  },
  {
    name: 'Heat Wave Alert (Monstera)',
    description: '35°C ambient temperature with dry soil. Immediate deep watering recommended.',
    data: {
      plant_id: 'monstera',
      growth_stage: 'vegetative' as GrowthStage,
      soil_type: 'potting_mix' as SoilType,
      pot_size: 'medium' as PotSize,
      has_drainage: true,
      light_exposure: 'indoor_bright' as LightExposure,
      moisture_type: 'qualitative' as MoistureMeasurementType,
      moisture_qualitative: 'dry' as QualitativeMoisture,
      latitude: 33.44,
      longitude: -112.07,
      location_name: 'Phoenix Heat Wave',
      use_demo_weather: true,
    },
  },
  {
    name: 'Succulent Overwater Danger (Snake Plant)',
    description: 'Slightly moist soil in a pot without drainage. Engine should advise strict WAIT.',
    data: {
      plant_id: 'snake_plant',
      growth_stage: 'mature' as GrowthStage,
      soil_type: 'cactus_mix' as SoilType,
      pot_size: 'medium' as PotSize,
      has_drainage: false,
      light_exposure: 'indoor_low' as LightExposure,
      moisture_type: 'qualitative' as MoistureMeasurementType,
      moisture_qualitative: 'slightly_moist' as QualitativeMoisture,
      latitude: 51.50,
      longitude: -0.12,
      location_name: 'London Indoor',
      use_demo_weather: true,
    },
  },
  {
    name: 'Delicate Seedling (Basil)',
    description: 'Seedling stage with 18% moisture. Moisture stress is dangerous at seedling stage.',
    data: {
      plant_id: 'basil',
      growth_stage: 'seedling' as GrowthStage,
      soil_type: 'potting_mix' as SoilType,
      pot_size: 'small' as PotSize,
      has_drainage: true,
      light_exposure: 'full_sun' as LightExposure,
      moisture_type: 'percentage' as MoistureMeasurementType,
      moisture_value: 18,
      latitude: 12.97,
      longitude: 77.59,
      location_name: 'Greenhouse Bench',
      use_demo_weather: false,
    },
  },
];

export const AdvisoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [plants, setPlants] = useState<PlantProfile[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AdvisoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [plantId, setPlantId] = useState<string>(searchParams.get('plant') || 'monstera');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('vegetative');
  const [soilType, setSoilType] = useState<SoilType>('potting_mix');
  const [potSize, setPotSize] = useState<PotSize>('medium');
  const [hasDrainage, setHasDrainage] = useState<boolean>(true);
  const [lightExposure, setLightExposure] = useState<LightExposure>('indoor_bright');

  // Moisture state
  const [moistureType, setMoistureType] = useState<MoistureMeasurementType>('qualitative');
  const [moistureQualitative, setMoistureQualitative] = useState<QualitativeMoisture>('dry');
  const [moistureValue, setMoistureValue] = useState<number>(20);

  // Location / Weather
  const [locationName, setLocationName] = useState<string>('Bangalore, India');
  const [latitude, setLatitude] = useState<number>(12.97);
  const [longitude, setLongitude] = useState<number>(77.59);
  const [useDemoWeather, setUseDemoWeather] = useState<boolean>(false);

  useEffect(() => {
    api.getPlants()
      .then((data) => {
        setPlants(data);
        if (data.length > 0 && !searchParams.get('plant')) {
          setPlantId(data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingPlants(false));
  }, [searchParams]);

  const loadScenario = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setPlantId(scenario.data.plant_id);
    setGrowthStage(scenario.data.growth_stage);
    setSoilType(scenario.data.soil_type);
    setPotSize(scenario.data.pot_size);
    setHasDrainage(scenario.data.has_drainage);
    setLightExposure(scenario.data.light_exposure);
    setMoistureType(scenario.data.moisture_type);
    if (scenario.data.moisture_qualitative) {
      setMoistureQualitative(scenario.data.moisture_qualitative);
    }
    if (scenario.data.moisture_value !== undefined) {
      setMoistureValue(scenario.data.moisture_value);
    }
    setLatitude(scenario.data.latitude);
    setLongitude(scenario.data.longitude);
    setLocationName(scenario.data.location_name);
    setUseDemoWeather(scenario.data.use_demo_weather);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: AdvisoryRequest = {
      plant_id: plantId,
      growth_stage: growthStage,
      soil_type: soilType,
      pot_size: potSize,
      has_drainage: hasDrainage,
      light_exposure: lightExposure,
      moisture_type: moistureType,
      latitude,
      longitude,
      location_name: locationName,
      use_demo_weather: useDemoWeather,
    };

    if (moistureType === 'qualitative') {
      payload.moisture_qualitative = moistureQualitative;
    } else {
      payload.moisture_value = moistureValue;
    }

    try {
      const res = await api.createAdvisory(payload);
      setResult(res);
      // Scroll to result on mobile
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Failed to synthesize advisory recommendation.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlant = plants.find((p) => p.id === plantId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Advisory Synthesis Engine
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Combine plant species parameters, current soil moisture, and meteorological telemetry to obtain an explainable watering advisory.
        </p>
      </div>

      {/* Preset Evaluation Scenarios */}
      <div className="card p-5 bg-gradient-to-r from-teal-50/70 to-emerald-50/40 border border-teal-200/80 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-teal-700" />
          <span>One-Click Test Scenarios (Capstone Evaluation)</span>
        </div>
        <p className="text-xs text-stone-600 mb-3">
          Select a verified scenario to immediately populate parameters and verify engine edge cases:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((sc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadScenario(sc)}
              className="text-left p-3 rounded-xl bg-white hover:bg-teal-50 border border-stone-200 hover:border-teal-300 transition text-xs group shadow-xs"
            >
              <div className="font-bold text-stone-900 group-hover:text-teal-800">
                {sc.name}
              </div>
              <div className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {sc.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="card p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-700" />
              <span>Plant & Environmental Parameters</span>
            </h2>

            {/* 1. Plant Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Target Botanical Species *
              </label>
              {loadingPlants ? (
                <div className="h-10 bg-stone-100 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={plantId}
                  onChange={(e) => setPlantId(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                >
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.scientific_name ? `(${p.scientific_name})` : ''} — {p.care_difficulty} care
                    </option>
                  ))}
                </select>
              )}
              {selectedPlant && (
                <div className="mt-2 p-2.5 bg-stone-50 rounded-xl text-xs text-stone-600 border border-stone-100">
                  <span className="font-semibold text-stone-700">Guidance: </span>
                  {selectedPlant.moisture_guidance.summary}
                </div>
              )}
            </div>

            {/* 2. Growth Stage & Light Exposure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Growth Stage
                </label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                >
                  <option value="seedling">Seedling (High sensitivity)</option>
                  <option value="vegetative">Vegetative (Active foliage)</option>
                  <option value="flowering">Flowering (Budding/Bloom)</option>
                  <option value="fruiting">Fruiting</option>
                  <option value="dormant">Dormant (Low water demand)</option>
                  <option value="mature">Mature / Established</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Light Exposure
                </label>
                <select
                  value={lightExposure}
                  onChange={(e) => setLightExposure(e.target.value as LightExposure)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                >
                  <option value="full_sun">Full Direct Sun (6+ hrs)</option>
                  <option value="partial_sun">Partial Sun / Filtered</option>
                  <option value="shade">Deep Shade</option>
                  <option value="indoor_bright">Indoor Bright Indirect</option>
                  <option value="indoor_low">Indoor Low Light</option>
                </select>
              </div>
            </div>

            {/* 3. Soil Type & Potting */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Soil / Substrate
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                >
                  <option value="potting_mix">Standard Potting Mix</option>
                  <option value="cactus_mix">Cactus / Succulent Mix (Fast drain)</option>
                  <option value="cocopeat">Cocopeat / Coir (High retention)</option>
                  <option value="loamy">Loamy Garden Soil</option>
                  <option value="sandy">Sandy Soil</option>
                  <option value="clay">Heavy Clay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Pot Size
                </label>
                <select
                  value={potSize}
                  onChange={(e) => setPotSize(e.target.value as PotSize)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                >
                  <option value="small">Small (&lt; 15 cm)</option>
                  <option value="medium">Medium (15 - 30 cm)</option>
                  <option value="large">Large (30 - 50 cm)</option>
                  <option value="extra_large">Extra Large (&gt; 50 cm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Drainage Hole
                </label>
                <div className="flex items-center h-10 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                    <input
                      type="radio"
                      name="drainage"
                      checked={hasDrainage === true}
                      onChange={() => setHasDrainage(true)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Yes (Drainable)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-rose-700">
                    <input
                      type="radio"
                      name="drainage"
                      checked={hasDrainage === false}
                      onChange={() => setHasDrainage(false)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>No Hole (Danger)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. Soil Moisture Reading */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Soil Moisture Observation *
                </label>
                <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setMoistureType('qualitative')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${
                      moistureType === 'qualitative' ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Touch / Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoistureType('percentage')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${
                      moistureType === 'percentage' ? 'bg-white text-teal-800 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Sensor Probe (%)
                  </button>
                </div>
              </div>

              {moistureType === 'qualitative' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'dry', label: 'Dry', desc: 'No moisture felt, dusty or crumbly' },
                    { id: 'slightly_moist', label: 'Slightly Moist', desc: 'Cool to touch, no stickiness' },
                    { id: 'moist', label: 'Moist', desc: 'Damp, dark soil, slight residue' },
                    { id: 'wet', label: 'Wet / Saturated', desc: 'Waterlogged, muddy or pooled' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setMoistureQualitative(lvl.id as QualitativeMoisture)}
                      className={`p-3 rounded-xl border text-left transition ${
                        moistureQualitative === lvl.id
                          ? 'border-teal-600 bg-teal-50/80 text-teal-950 ring-2 ring-teal-600/20'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{lvl.label}</div>
                      <div className="text-[10px] text-stone-500 mt-1 leading-tight">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">Probe Reading:</span>
                    <span className="text-lg font-bold text-teal-700 font-mono">{moistureValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={moistureValue}
                    onChange={(e) => setMoistureValue(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>0% (Bone dry)</span>
                    <span>30% (Moist)</span>
                    <span>60% (Saturated)</span>
                    <span>100% (Flooded)</span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Geographic Location & Weather Telemetry */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  <span>Meteorological Station</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDemoWeather}
                    onChange={(e) => setUseDemoWeather(e.target.checked)}
                    className="text-teal-600 focus:ring-teal-500 rounded"
                  />
                  <span>Simulate Rain / Heat (Demo)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="City / Region description"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 focus:border-teal-600 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    placeholder="Lat"
                    className="w-1/2 rounded-xl border border-stone-300 bg-white px-2 py-2 text-xs text-stone-800 text-center outline-none"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    placeholder="Lon"
                    className="w-1/2 rounded-xl border border-stone-300 bg-white px-2 py-2 text-xs text-stone-800 text-center outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Decision Matrix...</span>
                  </>
                ) : (
                  <>
                    <Droplets className="w-4 h-4" />
                    <span>Synthesize Plant Advisory</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Advisory Output Column */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-700" />
                <span>Synthesized Recommendation</span>
              </h2>
              <AdvisoryResultCard result={result} />
            </div>
          ) : (
            <div className="card p-8 bg-stone-50/70 border-2 border-dashed border-stone-200 rounded-2xl text-center">
              <Droplets className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-stone-800">Awaiting Input Parameters</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Configure the plant species, soil conditions, and weather location on the left, then click <strong>Synthesize Plant Advisory</strong>.
              </p>
              <div className="mt-6 pt-4 border-t border-stone-200/60 text-[11px] text-stone-400">
                Decision logic follows strict hierarchical evaluation: Overwatering Safeguards &rarr; Weather Preemptions &rarr; Botanical Moisture Limits.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
