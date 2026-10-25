import React from 'react';
import type { WeatherData } from '../types/api';
import { CloudRain, Thermometer, Droplets, Wind, RefreshCw, AlertCircle, Database } from 'lucide-react';

interface Props {
  weather: WeatherData | null;
  loading?: boolean;
  onRefresh?: () => void;
  compact?: boolean;
}

export const WeatherWidget: React.FC<Props> = ({
  weather,
  loading = false,
  onRefresh,
  compact = false,
}) => {
  if (loading) {
    return (
      <div className="card p-5 bg-white/70 animate-pulse flex items-center justify-center space-x-3 text-stone-500">
        <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
        <span className="text-sm font-medium">Fetching meteorological observation...</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card p-4 bg-stone-50 border border-stone-200 text-stone-600 text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <span>No weather data available. Select a location or refresh.</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white/80 border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs text-stone-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-semibold text-stone-900">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>{weather.temperature_c ?? '--'}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>{weather.relative_humidity_pct ?? '--'}% RH</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
            <span>{weather.forecast_rainfall_mm ?? 0} mm rain</span>
          </div>
        </div>
        <span className="text-[10px] text-stone-500">
          {weather.is_cached ? 'Cached' : 'Live'}
        </span>
      </div>
    );
  }

  return (
    <div className="card p-5 bg-gradient-to-br from-white/95 to-stone-50/90 border border-stone-200/80 rounded-2xl shadow-sm">
      <div className="flex items-start justify-between pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-800 text-sm tracking-tight">
              {weather.location_name || 'Current Meteorological Station'}
            </h3>
            {weather.is_cached && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                <Database className="w-2.5 h-2.5" /> Cached
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {weather.weather_description || 'Clear / Mild'} &bull; Lat: {weather.latitude.toFixed(2)}, Lon: {weather.longitude.toFixed(2)}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition"
            title="Refresh weather data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="bg-stone-100/60 p-2.5 rounded-xl border border-stone-200/50">
          <div className="flex items-center text-xs text-stone-500 gap-1.5 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Temperature</span>
          </div>
          <div className="text-lg font-bold text-stone-900">
            {weather.temperature_c !== null ? `${weather.temperature_c}°C` : '--'}
          </div>
          <div className="text-[10px] text-stone-500">
            Feels like {weather.apparent_temperature_c !== null ? `${weather.apparent_temperature_c}°C` : '--'}
          </div>
        </div>

        <div className="bg-stone-100/60 p-2.5 rounded-xl border border-stone-200/50">
          <div className="flex items-center text-xs text-stone-500 gap-1.5 mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>Humidity</span>
          </div>
          <div className="text-lg font-bold text-stone-900">
            {weather.relative_humidity_pct !== null ? `${weather.relative_humidity_pct}%` : '--'}
          </div>
          <div className="text-[10px] text-stone-500">Relative humidity</div>
        </div>

        <div className="bg-stone-100/60 p-2.5 rounded-xl border border-stone-200/50">
          <div className="flex items-center text-xs text-stone-500 gap-1.5 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
            <span>Rain (Past 24h)</span>
          </div>
          <div className="text-lg font-bold text-stone-900">
            {weather.rainfall_last_24h_mm !== null ? `${weather.rainfall_last_24h_mm} mm` : '0 mm'}
          </div>
          <div className="text-[10px] text-stone-500">Accumulated precipitation</div>
        </div>

        <div className="bg-stone-100/60 p-2.5 rounded-xl border border-stone-200/50">
          <div className="flex items-center text-xs text-stone-500 gap-1.5 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>24h Forecast</span>
          </div>
          <div className="text-lg font-bold text-stone-900">
            {weather.forecast_rainfall_mm !== null ? `${weather.forecast_rainfall_mm} mm` : '0 mm'}
          </div>
          <div className="text-[10px] text-stone-500">
            {weather.forecast_rain_probability_pct !== null ? `${weather.forecast_rain_probability_pct}% chance` : 'Low chance'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
        <span>Provider: {weather.provider}</span>
        <span className="italic truncate max-w-[280px]">{weather.attribution}</span>
      </div>
    </div>
  );
};
