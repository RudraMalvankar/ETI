import axios from 'axios';
import { clearStoredAuth, getStoredUser, storeUser } from './authStorage';
import { API_BASE_URL } from './apiBase';

const HEALTH_URL = API_BASE_URL.replace('/api/v1', '') + '/health';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
      return true;
    } catch {
      clearStoredAuth();
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as { _retry?: boolean; headers: Record<string, string> };
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const success = await refreshAccessToken();
      if (success) {
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  },
);

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await axios.get(HEALTH_URL, { timeout: 3000 });
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
}
