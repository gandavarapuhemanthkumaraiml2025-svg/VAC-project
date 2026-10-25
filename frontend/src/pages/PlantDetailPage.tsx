import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sprout,
  Droplet,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import type { PlantProfile } from '../types/api';

export const PlantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plant, setPlant] = useState<PlantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getPlant(id)
      .then(setPlant)
      .catch((err) => setError('Plant profile not found in botanical registry.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-stone-500">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs">Loading botanical profile...</span>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="card p-8 text-center bg-white border border-stone-200 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-stone-800">Plant Not Found</h2>
        <p className="text-xs text-stone-500 mt-1 mb-4">{error || 'Unknown plant identifier'}</p>
        <Link to="/plants" className="text-xs font-semibold text-teal-700 hover:underline">
          &larr; Back to Botanical Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link & actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/plants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
        <Link
          to={`/advisory?plant=${plant.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition"
        >
          <span>Evaluate This Plant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Profile Header */}
      <div className="card p-6 sm:p-8 bg-white border border-stone-200/90 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {plant.care_difficulty} care
              </span>
              <span className="text-xs text-stone-400 font-mono">ID: {plant.id}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">{plant.name}</h1>
            {plant.scientific_name && (
              <p className="text-sm italic text-stone-500 mt-0.5">{plant.scientific_name}</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-stone-700 text-sm leading-relaxed">{plant.profile_description}</p>
      </div>

      {/* Moisture Guidance & Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-teal-700" />
            <span>Moisture Guidance & Regimen</span>
          </h2>
          <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900 leading-relaxed">
            {plant.moisture_guidance.summary}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Preferred State:</span>
              <span className="font-semibold text-stone-800 capitalize">
                {plant.moisture_guidance.preferred_qualitative}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Acceptable:</span>
              <span className="font-medium text-stone-700">
                {plant.moisture_guidance.acceptable_qualitative.join(', ')}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Critical to Avoid:</span>
              <span className="font-semibold text-rose-700">
                {plant.moisture_guidance.avoid_qualitative.join(', ')}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-stone-500">Watering Frequency:</span>
              <span className="font-medium text-stone-800">
                {plant.moisture_guidance.watering_frequency_note}
              </span>
            </div>
          </div>

          {plant.moisture_guidance.percentage_guidance && (
            <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div className="font-semibold text-stone-700 mb-1">Moisture Probe Calibration:</div>
              <div className="text-stone-600 mb-2">
                {plant.moisture_guidance.percentage_guidance.note}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-700">
                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                  Dry: &lt;{plant.moisture_guidance.percentage_guidance.low_threshold_pct}%
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Target: {plant.moisture_guidance.percentage_guidance.adequate_range_pct[0]} - {plant.moisture_guidance.percentage_guidance.adequate_range_pct[1]}%
                </span>
                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                  Excess: &gt;{plant.moisture_guidance.percentage_guidance.high_threshold_pct}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Symptoms Breakdown: Under vs Over */}
        <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Diagnostic Symptoms (Horticulture)</span>
          </h2>

          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <div className="font-bold text-xs text-amber-900 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Signs of Under-Watering (Drought Stress)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                {plant.moisture_guidance.signs_of_underwatering.map((sign, idx) => (
                  <li key={idx}>{sign}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl">
              <div className="font-bold text-xs text-rose-900 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                <span>Signs of Over-Watering (Root Hypoxia)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-rose-800 space-y-1">
                {plant.moisture_guidance.signs_of_overwatering.map((sign, idx) => (
                  <li key={idx}>{sign}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Stages Table */}
      {plant.growth_stages && plant.growth_stages.length > 0 && (
        <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm">
          <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-teal-700" />
            <span>Growth Stage Dynamics</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Moisture Regimen</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Horticultural Caution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {plant.growth_stages.map((st, i) => (
                  <tr key={i} className="hover:bg-stone-50/60 transition">
                    <td className="py-3 px-3 font-semibold text-stone-900">{st.label}</td>
                    <td className="py-3 px-3">{st.moisture_note}</td>
                    <td className="py-3 px-3 font-medium text-teal-800">{st.watering_frequency}</td>
                    <td className="py-3 px-3 text-stone-500 italic">{st.caution || 'Standard monitoring'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Soil Preferences */}
      {plant.soil_preferences && (
        <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm">
          <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-700" />
            <span>Soil Substrate Preferences</span>
          </h2>
          <p className="text-xs text-stone-600 mb-4">{plant.soil_preferences.notes}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="font-bold text-emerald-900 block mb-1">Recommended:</span>
              <span className="text-emerald-800">{plant.soil_preferences.recommended.join(', ')}</span>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="font-bold text-stone-700 block mb-1">Acceptable:</span>
              <span className="text-stone-600">{plant.soil_preferences.acceptable.join(', ')}</span>
            </div>
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
              <span className="font-bold text-rose-900 block mb-1">Avoid:</span>
              <span className="text-rose-800">{plant.soil_preferences.avoid.join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
