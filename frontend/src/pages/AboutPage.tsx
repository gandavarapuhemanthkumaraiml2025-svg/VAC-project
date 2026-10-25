import React, { useState, useEffect } from 'react';
import {
  Info,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  Server,
  Layers,
  CheckCircle2,
  Code
} from 'lucide-react';
import { api } from '../services/api';
import type { SourceRecord } from '../types/api';

export const AboutPage: React.FC = () => {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSources()
      .then(setSources)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          System Architecture & Horticultural Citations
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          RootWise Capstone 10: Plant Care Intelligence. Engineering specifications, system topology, and scientific bibliographies.
        </p>
      </div>

      {/* Capstone Mission & Engineering Principles */}
      <div className="card p-6 sm:p-8 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-700" />
          <span>Capstone Mission & Engineering Objectives</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          Overwatering accounts for the vast majority of domestic and greenhouse houseplant deaths through root rot (rhizosphere hypoxia). Traditional calendar-based watering alarms fail because they disregard weather conditions, ambient temperatures, and pot drainage mechanics.
        </p>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          RootWise solves this by serving as a <strong>source-grounded, explainable advisory engine</strong>. Rather than providing unverified black-box predictions, it guarantees safety through strict botanical heuristics validated against university agricultural extensions and meteorological live feeds.
        </p>
      </div>

      {/* Architecture Topology */}
      <div className="card p-6 bg-stone-900 text-white rounded-3xl shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
          <Server className="w-4 h-4" />
          <span>Full-Stack Architecture Overview</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <div className="font-bold text-teal-300 text-sm mb-1">Frontend UI</div>
            <p className="text-stone-300 leading-relaxed">
              React 18 + TypeScript + Vite + Tailwind CSS. Component-driven design, responsive drawer, reactive telemetry cards, and zero external widget dependencies.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <div className="font-bold text-teal-300 text-sm mb-1">FastAPI Backend</div>
            <p className="text-stone-300 leading-relaxed">
              Python 3.10+ async REST API, Pydantic v2 validation, SQLAlchemy ORM, and deterministic decision engine evaluating 20+ botanical rules in microseconds.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <div className="font-bold text-teal-300 text-sm mb-1">Data & Weather Layer</div>
            <p className="text-stone-300 leading-relaxed">
              SQLite relational database for plants, rules, and historical audit logs. Open-Meteo REST client with in-memory TTL caching and demo fallback simulator.
            </p>
          </div>
        </div>
      </div>

      {/* Horticultural Citations Directory */}
      <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Horticultural Citation Registry ({sources.length})</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Every rule and threshold in the engine is mapped directly to these peer-reviewed institutions:
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-stone-500">Loading citation records...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {src.id}
                  </span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-stone-400 hover:text-stone-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="font-bold text-xs text-stone-900">{src.title}</div>
                <div className="text-[11px] text-stone-500">
                  Publisher: {src.publisher || 'Agricultural Research Extension'}
                </div>
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {src.relevant_guidance}
                </p>
                {src.covered_rules && (
                  <div className="pt-2 border-t border-stone-200/60 flex flex-wrap gap-1 text-[10px]">
                    <span className="text-stone-400">Rules:</span>
                    {src.covered_rules.map((r) => (
                      <span key={r} className="font-mono text-stone-600 bg-stone-200/70 px-1.5 py-0.2 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Limitations & Boundary Conditions */}
      <div className="card p-6 bg-white border border-stone-200/90 rounded-2xl shadow-sm space-y-3">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Limitations & Boundary Conditions</span>
        </h2>
        <ul className="space-y-2 text-xs text-stone-600">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">&bull;</span>
            <span>
              <strong>Microclimate Variations:</strong> Indoor heating, air conditioning vents, and proximity to cold window panes can cause localized drying not captured by regional meteorological readings.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">&bull;</span>
            <span>
              <strong>Soil Compaction & Substrate Aging:</strong> Peat-based potting mixes become hydrophobic when completely dried out, requiring bottom-watering rather than surface pouring.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">&bull;</span>
            <span>
              <strong>Sensor Probe Depth:</strong> Surface moisture probes may report dry conditions while root balls remain saturated. RootWise recommends inserting probes at least 50% down into the root zone.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
