import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Sprout,
  Droplets,
  CloudSun,
  BookOpen,
  Database,
  Info,
  Menu,
  X,
  Compass,
  Activity,
  Layers,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { HealthStatus } from '../types/api';

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    api.health()
      .then(setHealth)
      .catch(() => setHealth({
        status: 'demo-mode',
        version: '1.0.0',
        database: 'offline-ready',
        weather_provider: 'Open-Meteo',
        timestamp: new Date().toISOString()
      }));
  }, []);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Compass, exact: true },
    { to: '/advisory', label: 'Advisory Engine', icon: Droplets, highlight: true },
    { to: '/plants', label: 'Plant Library', icon: Sprout },
    { to: '/weather', label: 'Weather Station', icon: CloudSun },
    { to: '/observations', label: 'Soil Observations', icon: Layers },
    { to: '/rules', label: 'Knowledge & Rules', icon: BookOpen },
    { to: '/dataset', label: 'Dataset & ML Eval', icon: Database },
    { to: '/about', label: 'Architecture & Sources', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NavLink to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-800 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-teal-900/20">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-stone-900">
                  ROOT<span className="text-teal-700">WISE</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Plant Care Intelligence
                </span>
              </div>
            </NavLink>
          </div>

          <div className="flex items-center gap-4">
            {health && (
              <div className="hidden md:flex items-center gap-2 text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">System Online</span>
                <span className="text-stone-400">&bull;</span>
                <span className="text-stone-500">{health.weather_provider}</span>
              </div>
            )}
            <NavLink
              to="/advisory"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition active:scale-95"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Get Advisory</span>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="sticky top-24 space-y-1 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-stone-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/10 font-semibold'
                        : item.highlight
                        ? 'text-teal-800 bg-teal-50/60 hover:bg-teal-100/60'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="mt-6 pt-4 border-t border-stone-100 px-3 text-xs text-stone-500">
              <div className="font-semibold text-stone-700 mb-1">Capstone Advisory Model</div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Source-grounded decision tree combining botanical thresholds, real-time weather & qualitative soil state.
              </p>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full p-4 shadow-xl flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <span className="font-extrabold text-stone-900 text-lg">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                          isActive
                            ? 'bg-teal-700 text-white font-semibold'
                            : 'text-stone-600 hover:bg-stone-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-stone-200 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-teal-700" />
            <span className="font-semibold text-stone-700">RootWise Plant Care Intelligence</span>
            <span>&bull; Capstone 10 Engineering System</span>
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Powered by Open-Meteo & USDA/RHS Horticultural Knowledge</span>
            <NavLink to="/about" className="text-teal-700 hover:underline font-medium">
              Methodology & Citations
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
