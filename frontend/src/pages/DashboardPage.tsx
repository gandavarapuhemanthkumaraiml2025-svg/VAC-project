import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Sprout,
  ShieldCheck,
  CloudSun,
  ArrowRight,
  TrendingUp,
  History,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import type { PlantProfile, WeatherData, AdvisoryHistoryItem } from '../types/api';
import { DecisionBadge } from '../components/DecisionBadge';
import { WeatherWidget } from '../components/WeatherWidget';
import { PlantCard } from '../components/PlantCard';

export const DashboardPage: React.FC = () => {
  const [plants, setPlants] = useState<PlantProfile[]>([]);
  const [history, setHistory] = useState<AdvisoryHistoryItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [plantsData, historyData, weatherData] = await Promise.all([
          api.getPlants().catch(() => []),
          api.getAdvisoryHistory({ limit: 5 }).catch(() => []),
          api.getWeather({ latitude: 12.97, longitude: 77.59, location_name: 'Bangalore Station (Demo)' }).catch(() => null),
        ]);
        setPlants(plantsData);
        setHistory(historyData);
        setWeather(weatherData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-4">
            <Sprout className="w-3.5 h-3.5" />
            <span>AI-Assisted Horticultural Decision Support</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Precision Watering Guidance Backed by Botanical Science
          </h1>
          <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed mb-6">
            Prevent plant mortality from overwatering and drought stress. RootWise synthesizes species biology, soil moisture observations, and live meteorological forecasts into transparent, source-attributed watering decisions.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/advisory"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition shadow-lg active:scale-95"
            >
              <Droplets className="w-4 h-4 text-teal-700" />
              <span>Evaluate a Plant Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/rules"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-800/60 hover:bg-teal-800 text-teal-100 border border-teal-600/40 font-semibold text-sm transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Explore Decision Logic</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Sprout className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{plants.length || 8}</div>
              <div className="text-xs text-stone-500 font-medium">Curated Species</div>
            </div>
          </div>
        </div>

        <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">20+</div>
              <div className="text-xs text-stone-500 font-medium">Heuristic Rules</div>
            </div>
          </div>
        </div>

        <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">Open-Meteo</div>
              <div className="text-xs text-stone-500 font-medium">Real-Time Forecasts</div>
            </div>
          </div>
        </div>

        <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{history.length}</div>
              <div className="text-xs text-stone-500 font-medium">Logged Advisories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Weather & Recent Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-teal-700" />
              <span>Live Weather Telemetry</span>
            </h2>
            <WeatherWidget weather={weather} loading={loading} />
          </div>

          <div className="card p-5 bg-teal-50/50 border border-teal-200/60 rounded-2xl">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4 text-teal-700" />
              <span>Explainable AI Principle</span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              Every RootWise recommendation is fully transparent. The engine cites specific horticultural rules (e.g., <code className="bg-teal-100 px-1 py-0.5 rounded text-[11px] font-mono">RULE_RAIN_IMMINENT</code>, <code className="bg-teal-100 px-1 py-0.5 rounded text-[11px] font-mono">RULE_HIGH_HEAT_ALERT</code>) and links back to verified extension services (RHS, USDA, UMN Extension).
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-700" />
              <span>Recent Decision Audit Trail</span>
            </h2>
            <Link to="/advisory" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              Run New Evaluation &rarr;
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="card p-8 text-center bg-white border border-stone-200/80 rounded-2xl">
              <Droplets className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-stone-800">No Advisory Runs Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                Run your first plant watering evaluation to test the multi-factor decision engine.
              </p>
              <Link
                to="/advisory"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Start Evaluation</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="card p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm hover:shadow transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DecisionBadge decision={item.decision} size="sm" />
                      <span className="text-xs font-bold text-stone-800">
                        {item.plant_id ? item.plant_id.replace('_', ' ').toUpperCase() : 'General Plant'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1">{item.recommendation}</p>
                  </div>
                  <div className="text-[11px] text-stone-400 shrink-0">
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Botanical Species */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-teal-700" />
              <span>Plant Botanical Library</span>
            </h2>
            <p className="text-xs text-stone-500">
              Select any plant to view tailored watering profiles, soil tolerances, and sensitivity thresholds.
            </p>
          </div>
          <Link to="/plants" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
            View All ({plants.length || 8}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plants.slice(0, 4).map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </div>
    </div>
  );
};
