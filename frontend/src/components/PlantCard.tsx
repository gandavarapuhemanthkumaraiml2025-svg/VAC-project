import React from 'react';
import type { PlantProfile } from '../types/api';
import { Sprout, Droplet, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  plant: PlantProfile;
  onSelect?: (plant: PlantProfile) => void;
}

export const PlantCard: React.FC<Props> = ({ plant, onSelect }) => {
  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    hard: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-stone-200/80 group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-stone-900 group-hover:text-teal-700 transition">
              {plant.name}
            </h3>
            {plant.scientific_name && (
              <p className="text-xs italic text-stone-500">{plant.scientific_name}</p>
            )}
          </div>
          <span
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
              difficultyColors[plant.care_difficulty] || 'bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {plant.care_difficulty}
          </span>
        </div>

        <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
          {plant.profile_description}
        </p>

        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-100 text-xs text-stone-600 mb-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <Droplet className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              <strong>Moisture:</strong> {plant.moisture_guidance.preferred_qualitative}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              <strong>Frequency:</strong> {plant.moisture_guidance.watering_frequency_note}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
        <Link
          to={`/plants/${plant.id}`}
          className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-xl text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition"
        >
          View Guide
        </Link>
        <Link
          to={`/advisory?plant=${plant.id}`}
          className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-semibold rounded-xl text-white bg-teal-700 hover:bg-teal-800 transition"
        >
          <span>Advise</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
