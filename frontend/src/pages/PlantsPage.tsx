import React, { useState, useEffect } from 'react';
import { Sprout, Search, Filter, RefreshCw, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import type { PlantProfile } from '../types/api';
import { PlantCard } from '../components/PlantCard';

export const PlantsPage: React.FC = () => {
  const [plants, setPlants] = useState<PlantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'moderate' | 'hard'>('all');

  useEffect(() => {
    api.getPlants()
      .then(setPlants)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.scientific_name && p.scientific_name.toLowerCase().includes(search.toLowerCase())) ||
      p.profile_description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === 'all' || p.care_difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Botanical Plant Library
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Curated horticultural profiles with soil tolerances, growth stages, and moisture sensitivity bands.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="card p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search plant by name, genus, or characteristics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:border-teal-600 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-700 outline-none"
          >
            <option value="all">All Care Levels</option>
            <option value="easy">Easy Care</option>
            <option value="moderate">Moderate Care</option>
            <option value="hard">Expert / Sensitive</option>
          </select>
        </div>
      </div>

      {/* Plant Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
          <span className="text-xs">Loading plant encyclopedia...</span>
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-stone-200 rounded-2xl">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No Plants Matched</h3>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your search query or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
};
