import axios from 'axios';
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  updateStoredAccessToken,
  updateStoredRefreshToken,
} from './authStorage';
import { API_BASE_URL } from './apiBase';

const HEALTH_URL = API_BASE_URL.replace('/api/v1', '') + '/health';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredAuth();
    return null;
  }

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    updateStoredAccessToken(res.data.access_token);
    updateStoredRefreshToken(res.data.refresh_token);
    return res.data.access_token as string;
  } catch {
    clearStoredAuth();
    return null;
  }
}

apiClient.interceptors.request.use(config => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as { _retry?: boolean; headers: Record<string, string> };
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  }
);

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await axios.get(HEALTH_URL, { timeout: 3000 });
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
}
