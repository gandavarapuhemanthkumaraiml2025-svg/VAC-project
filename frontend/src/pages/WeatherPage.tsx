import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  RefreshCw,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import type { WeatherData } from '../types/api';
import { WeatherWidget } from '../components/WeatherWidget';

const CITIES = [
  { name: 'Bangalore, India', lat: 12.97, lon: 77.59 },
  { name: 'London, UK', lat: 51.50, lon: -0.12 },
  { name: 'Phoenix, Arizona (Arid)', lat: 33.44, lon: -112.07 },
  { name: 'Seattle, Washington (Rainy)', lat: 47.60, lon: -122.33 },
  { name: 'Tokyo, Japan', lat: 35.68, lon: 139.69 },
  { name: 'Sydney, Australia', lat: -33.86, lon: 151.20 },
];

export const WeatherPage: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [lat, setLat] = useState(CITIES[0].lat);
  const [lon, setLon] = useState(CITIES[0].lon);
  const [locationName, setLocationName] = useState(CITIES[0].name);
  const [demoMode, setDemoMode] = useState(false);

  const fetchWeather = async (force = false) => {
    setLoading(true);
    try {
      const data = await api.getWeather({
        latitude: lat,
        longitude: lon,
        location_name: locationName,
        force_refresh: force,
        demo: demoMode,
      });
      setWeather(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [lat, lon, demoMode]);

  const handleCityChange = (city: typeof CITIES[0]) => {
    setSelectedCity(city);
    setLat(city.lat);
    setLon(city.lon);
    setLocationName(city.name);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Meteorological Weather Station
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          RootWise consumes hyper-local meteorological forecasts from Open-Meteo to anticipate rain events and temperature spikes before advising watering.
        </p>
      </div>

      {/* City Presets Bar */}
      <div className="card p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>Preset Observational Stations</span>
          </span>
          <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Simulate Extreme Weather (Demo Fallback)</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => handleCityChange(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCity.name === c.name
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Weather Card View */}
      <WeatherWidget
        weather={weather}
        loading={loading}
        onRefresh={() => fetchWeather(true)}
      />

      {/* Integration Explanation & Open-Meteo Attribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-700" />
            <span>Meteorological Integration Logic</span>
          </h2>
          <ul className="space-y-2 text-xs text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-700 font-bold">&bull;</span>
              <span>
                <strong>Rain Preemption:</strong> If forecast precipitation &gt; 5mm within 24 hours, watering is deferred to avoid root rot and nutrient leaching.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-700 font-bold">&bull;</span>
              <span>
                <strong>Evapotranspiration Adjustment:</strong> High ambient temperatures (&gt; 32°C) increase soil evaporation rate by up to 2.5x, prompting earlier moisture checks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-700 font-bold">&bull;</span>
              <span>
                <strong>Graceful Degradation:</strong> If the meteorological API is unreachable, RootWise issues conservative fallbacks and flags the advisory as lower evidence quality.
              </span>
            </li>
          </ul>
        </div>

        <div className="card p-5 bg-white border border-stone-200/80 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>Telemetry Cache & Policy</span>
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Meteorological readings are cached in-memory with a 15-minute Time-To-Live (TTL) to respect Open-Meteo's non-commercial fair use guidelines while providing sub-second latency for advisory generation.
          </p>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>Cache Policy: 15-minute TTL per GPS cell</span>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="text-teal-700 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Open-Meteo Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
