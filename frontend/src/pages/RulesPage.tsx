import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Filter,
  Layers,
  Search,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { RuleCard } from '../components/RuleCard';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');

  useEffect(() => {
    api.getRules()
      .then((data: any) => setRules(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesDecision = decisionFilter === 'all' || r.decision === decisionFilter;
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Knowledge Base & Explainable Decision Rules
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          RootWise implements a hierarchical, transparent decision matrix grounded in peer-reviewed horticultural research from the Royal Horticultural Society (RHS) and USDA Extension services.
        </p>
      </div>

      {/* Decision Hierarchy Explanation Banner */}
      <div className="card p-6 bg-gradient-to-r from-stone-900 to-teal-950 text-white rounded-3xl shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
          <Layers className="w-4 h-4" />
          <span>Hierarchical Rule Priority Architecture</span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
          Unlike black-box models, RootWise evaluates conditions through an explicit four-tier safety pipeline to prevent lethal overwatering:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="font-mono text-[10px] text-teal-300 font-bold block mb-1">TIER 1 (P1 - P5)</span>
            <div className="font-bold text-white mb-1">Hydrological Safeguards</div>
            <p className="text-[11px] text-stone-300">
              Evaluates soil saturation, lack of drainage holes, and standing water. Immediately stops overwatering.
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="font-mono text-[10px] text-teal-300 font-bold block mb-1">TIER 2 (P6 - P10)</span>
            <div className="font-bold text-white mb-1">Meteorological Preemption</div>
            <p className="text-[11px] text-stone-300">
              Checks 24h rainfall forecasts and past 24h precipitation to defer redundant manual watering.
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="font-mono text-[10px] text-teal-300 font-bold block mb-1">TIER 3 (P11 - P15)</span>
            <div className="font-bold text-white mb-1">Thermal & Seasonal Stress</div>
            <p className="text-[11px] text-stone-300">
              Adjusts for extreme heat waves (&gt;35°C), cold snaps, and winter dormant metabolic slowdown.
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="font-mono text-[10px] text-teal-300 font-bold block mb-1">TIER 4 (P16 - P25)</span>
            <div className="font-bold text-white mb-1">Botanical Sensitivity</div>
            <p className="text-[11px] text-stone-300">
              Applies species-specific soil thresholds (succulent dryout requirements, seedling moisture protection).
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search rules by ID, condition, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:border-teal-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-700 outline-none"
          >
            <option value="all">All Outcome Actions</option>
            <option value="WATER_NOW">WATER_NOW</option>
            <option value="CHECK_SOIL">CHECK_SOIL</option>
            <option value="WAIT">WAIT / DEFER</option>
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-xs">
          Loading decision matrix rules...
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-stone-200 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No Rules Matched</h3>
          <p className="text-xs text-stone-500 mt-1">Try relaxing your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((r) => (
            <RuleCard key={r.id} rule={r} />
          ))}
        </div>
      )}
    </div>
  );
};
