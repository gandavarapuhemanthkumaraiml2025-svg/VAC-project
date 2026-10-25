import React, { useState, useEffect } from 'react';
import {
  Layers,
  PlusCircle,
  RefreshCw,
  Clock,
  Sprout,
  CheckCircle,
  AlertCircle,
  Calendar,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import type { PlantProfile, ObservationCreate, QualitativeMoisture, MoistureMeasurementType } from '../types/api';

export const ObservationsPage: React.FC = () => {
  const [plants, setPlants] = useState<PlantProfile[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [plantId, setPlantId] = useState<string>('monstera');
  const [measurementType, setMeasurementType] = useState<MoistureMeasurementType>('qualitative');
  const [qualitativeValue, setQualitativeValue] = useState<QualitativeMoisture>('dry');
  const [sensorValue, setSensorValue] = useState<number>(22);
  const [sourceType, setSourceType] = useState<'manual' | 'sensor' | 'demo'>('manual');
  const [notes, setNotes] = useState<string>('');

  const loadData = async () => {
    try {
      const [plantsData, obsData] = await Promise.all([
        api.getPlants().catch(() => []),
        api.getObservations().catch(() => []),
      ]);
      setPlants(plantsData);
      setObservations(obsData as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    const payload: ObservationCreate = {
      plant_id: plantId,
      measurement_type: measurementType,
      observed_at: new Date().toISOString(),
      source_type: sourceType,
      notes: notes || undefined,
    };

    if (measurementType === 'qualitative') {
      payload.qualitative_value = qualitativeValue;
    } else {
      payload.measurement_value = sensorValue;
      payload.measurement_unit = '%';
    }

    try {
      await api.createObservation(payload);
      setSuccessMsg('Soil observation successfully recorded in SQLite database.');
      setNotes('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Soil Moisture Observations
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Log qualitative finger-probe checks or digital capacitive sensor telemetry to build a longitudinal soil moisture record.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form to log observation */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-teal-700" />
              <span>Log Soil Observation</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Target Plant
              </label>
              <select
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 outline-none focus:border-teal-600"
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.care_difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Measurement Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMeasurementType('qualitative')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    measurementType === 'qualitative'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  Qualitative (Finger Check)
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementType('percentage')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    measurementType === 'percentage'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  Capacitive Sensor (%)
                </button>
              </div>
            </div>

            {measurementType === 'qualitative' ? (
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Soil Moisture State
                </label>
                <select
                  value={qualitativeValue}
                  onChange={(e) => setQualitativeValue(e.target.value as QualitativeMoisture)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-teal-600"
                >
                  <option value="dry">Dry — Top 2 inches dusty or dry</option>
                  <option value="slightly_moist">Slightly Moist — Cool to touch, minimal residue</option>
                  <option value="moist">Moist — Dark, cohesive soil, damp touch</option>
                  <option value="wet">Wet / Saturated — Waterlogged or muddy</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Moisture Probe Reading: {sensorValue}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sensorValue}
                  onChange={(e) => setSensorValue(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Observation Source
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-teal-600"
              >
                <option value="manual">Manual User Probe / Finger</option>
                <option value="sensor">IoT Sensor Gateway</option>
                <option value="demo">Synthetic Test Reading</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Notes / Physical Observations (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., foliage looking slightly wilted, repotted recently..."
                rows={2}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-teal-600"
              />
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 transition shadow-sm flex items-center justify-center gap-2 text-xs disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Recording Observation...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Save Observation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Observation Log Table */}
        <div className="lg:col-span-7">
          <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm">
            <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>Observation Audit Log</span>
              </span>
              <span className="text-xs text-stone-500 font-normal">
                {observations.length} records recorded
              </span>
            </h2>

            {loading ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-2" />
                <span>Loading observation timeline...</span>
              </div>
            ) : observations.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No observations logged yet. Use the form on the left to record your first measurement.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Plant</th>
                      <th className="py-2.5 px-3">Value</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Recorded At</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {observations.map((obs) => (
                      <tr key={obs.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {obs.plant_id || 'General'}
                        </td>
                        <td className="py-2.5 px-3">
                          {obs.measurement_type === 'percentage' ? (
                            <span className="font-mono font-bold text-teal-800">
                              {obs.measurement_value}%
                            </span>
                          ) : (
                            <span className="capitalize font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                              {obs.qualitative_value}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-stone-500 capitalize">
                          {obs.source_type}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-stone-400">
                          {new Date(obs.observed_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-stone-500 italic max-w-[150px] truncate">
                          {obs.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
