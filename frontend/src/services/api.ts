/**
 * RootWise API client layer.
 * All communication with the FastAPI backend goes through this module.
 * Configure the base URL via VITE_API_BASE_URL env variable.
 */
import type {
  PlantProfile, WeatherData, AdvisoryRequest, AdvisoryResponse,
  AdvisoryHistoryItem, SourceRecord, DatasetSummary, HealthStatus,
  ObservationCreate,
} from '../types/api';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const data = await res.json(); msg = data.detail ?? msg; } catch {}
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

// ── Health ────────────────────────────────────────────────────────────────────
export const api = {
  health: (): Promise<HealthStatus> =>
    request('/api/health'),

  // ── Plants ──────────────────────────────────────────────────────────────
  getPlants: (): Promise<PlantProfile[]> =>
    request('/api/plants'),

  getPlant: (id: string): Promise<PlantProfile> =>
    request(`/api/plants/${id}`),

  // ── Weather ─────────────────────────────────────────────────────────────
  getWeather: (params: {
    latitude: number;
    longitude: number;
    location_name?: string;
    force_refresh?: boolean;
    demo?: boolean;
  }): Promise<WeatherData> => {
    const q = new URLSearchParams({
      latitude: String(params.latitude),
      longitude: String(params.longitude),
      ...(params.location_name ? { location_name: params.location_name } : {}),
      ...(params.force_refresh ? { force_refresh: 'true' } : {}),
      ...(params.demo ? { demo: 'true' } : {}),
    });
    return request(`/api/weather?${q}`);
  },

  // ── Advisory ────────────────────────────────────────────────────────────
  createAdvisory: (body: AdvisoryRequest): Promise<AdvisoryResponse> =>
    request('/api/advisory', { method: 'POST', body: JSON.stringify(body) }),

  getAdvisoryHistory: (params?: {
    plant_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdvisoryHistoryItem[]> => {
    const q = new URLSearchParams();
    if (params?.plant_id) q.set('plant_id', params.plant_id);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));
    return request(`/api/advisory/history?${q}`);
  },

  // ── Observations ────────────────────────────────────────────────────────
  createObservation: (body: ObservationCreate) =>
    request('/api/observations', { method: 'POST', body: JSON.stringify(body) }),

  getObservations: (plant_id?: string) => {
    const q = plant_id ? `?plant_id=${plant_id}` : '';
    return request(`/api/observations${q}`);
  },

  // ── Sources ─────────────────────────────────────────────────────────────
  getSources: (): Promise<SourceRecord[]> =>
    request('/api/sources'),

  getRules: () => request('/api/sources/rules'),

  // ── Dataset ─────────────────────────────────────────────────────────────
  getDatasetSummary: (): Promise<DatasetSummary> =>
    request('/api/dataset/summary'),

  // ── Evaluation ──────────────────────────────────────────────────────────
  getEvaluation: () => request('/api/evaluation'),
};

export { ApiError };
