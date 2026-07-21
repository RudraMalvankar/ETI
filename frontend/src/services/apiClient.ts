import axios from 'axios';

// Read from Vite env var — falls back to localhost for dev convenience
export const API_BASE_URL =
  (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Derive health URL from the base (strip /api/v1 suffix)
const HEALTH_URL = API_BASE_URL.replace('/api/v1', '') + '/health';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await axios.get(HEALTH_URL, { timeout: 3000 });
    return res.data?.status === 'ok';
  } catch (err) {
    return false;
  }
}
