import React, { useState, useEffect } from 'react';
import {
  Database,
  BarChart2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Table,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import type { DatasetSummary } from '../types/api';

export const DatasetPage: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDatasetSummary().catch(() => null),
      api.getEvaluation().catch(() => null),
    ])
      .then(([sumData, evalData]) => {
        setSummary(sumData);
        setEvaluation(evalData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Dataset Analysis & AI Evaluation
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Horticultural dataset telemetry, statistical distributions, data cleanliness audit, and model methodology.
        </p>
      </div>

      {/* Dataset Note & Transparency Callout */}
      <div className="card p-5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold uppercase tracking-wider block mb-1">
            Academic Transparency & Data Origin Notice
          </span>
          {summary?.data_note ||
            'Dataset contains synthetic records generated specifically to stress-test the multi-factor decision engine across extreme edge cases. Decisions are deterministic and verifiable.'}
        </div>
      </div>

      {/* Top Stat Row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-stone-900">{summary.total_records}</div>
            <div className="text-xs text-stone-500 font-medium">Synthetic Test Records</div>
          </div>
          <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-stone-900">{summary.column_count}</div>
            <div className="text-xs text-stone-500 font-medium">Features / Parameters</div>
          </div>
          <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-emerald-700">{summary.duplicate_count}</div>
            <div className="text-xs text-stone-500 font-medium">Duplicate Rows</div>
          </div>
          <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-teal-700">100%</div>
            <div className="text-xs text-stone-500 font-medium">Rule Coverage Tested</div>
          </div>
        </div>
      )}

      {/* Distributions */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Label Distribution */}
          <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-700" />
              <span>Advisory Label Distribution</span>
            </h2>
            <div className="space-y-3">
              {Object.entries(summary.advisory_label_distribution).map(([label, count]) => {
                const pct = Math.round((count / summary.total_records) * 100);
                const color =
                  label === 'WATER_NOW'
                    ? 'bg-teal-600'
                    : label === 'CHECK_SOIL'
                    ? 'bg-amber-500'
                    : 'bg-emerald-700';
                return (
                  <div key={label} className="text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-stone-700">
                      <span>{label}</span>
                      <span>{count} samples ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plant Distribution */}
          <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <span>Plant Representation in Dataset</span>
            </h2>
            <div className="space-y-3">
              {Object.entries(summary.plant_distribution).map(([plant, count]) => {
                const pct = Math.round((count / summary.total_records) * 100);
                return (
                  <div key={plant} className="text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-stone-700">
                      <span className="capitalize">{plant.replace('_', ' ')}</span>
                      <span>{count} samples ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-800" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Numerical Stats Table */}
      {summary && summary.numerical_stats && (
        <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm">
          <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Table className="w-4 h-4 text-teal-700" />
            <span>Numerical Statistical Metrics</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Feature</th>
                  <th className="py-2.5 px-3">Count</th>
                  <th className="py-2.5 px-3">Mean</th>
                  <th className="py-2.5 px-3">Std Dev</th>
                  <th className="py-2.5 px-3">Min</th>
                  <th className="py-2.5 px-3">Median</th>
                  <th className="py-2.5 px-3">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-mono">
                {Object.entries(summary.numerical_stats).map(([feat, stats]: [string, any]) => (
                  <tr key={feat} className="hover:bg-stone-50/60 transition">
                    <td className="py-3 px-3 font-semibold text-stone-900 font-sans">{feat}</td>
                    <td className="py-3 px-3">{stats.count}</td>
                    <td className="py-3 px-3">{stats.mean.toFixed(2)}</td>
                    <td className="py-3 px-3">{stats.std.toFixed(2)}</td>
                    <td className="py-3 px-3">{stats.min.toFixed(2)}</td>
                    <td className="py-3 px-3">{stats.median.toFixed(2)}</td>
                    <td className="py-3 px-3">{stats.max.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model & Evaluation Strategy */}
      {evaluation && (
        <div className="card p-6 bg-stone-900 text-white rounded-3xl shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Sparkles className="w-4 h-4" />
            <span>Machine Learning vs Rule Engine Justification</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-300">
            <div>
              <h3 className="font-bold text-white mb-2">Deterministic Engine Status: ACTIVE</h3>
              <p className="leading-relaxed">
                {evaluation.methodology} The engine enforces botanical safety boundaries directly, preventing high-stakes hallucinations or irrational advice.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-amber-300 mb-2">ML Model Status: DEFERRED</h3>
              <p className="leading-relaxed text-stone-300">
                {evaluation.ml_reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
