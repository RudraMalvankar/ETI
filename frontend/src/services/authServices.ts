import axios from 'axios';
import { apiClient } from './apiClient';
import {
  clearStoredAuth,
  getStoredRefreshToken,
  storeAuthSession,
  updateStoredAccessToken,
  updateStoredRefreshToken,
} from './authStorage';
import { AuthProfile, AuthTokens } from '../types/apex';

interface RegisterPayload {
  username: string;
  password: string;
}

interface LoginPayload extends RegisterPayload {}

export async function registerUser(payload: RegisterPayload): Promise<AuthProfile> {
  const res = await apiClient.post('/auth/register', payload);
  return res.data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthProfile> {
  const tokenRes = await apiClient.post<AuthTokens>('/auth/login', payload);
  const profile: AuthProfile = {
    username: payload.username,
    role: tokenRes.data.role,
  };

  storeAuthSession(tokenRes.data, profile);
  return profile;
}

export async function fetchCurrentUser(): Promise<AuthProfile> {
  const res = await apiClient.get<AuthProfile>('/auth/me');
  return res.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearStoredAuth();
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredAuth();
    return null;
  }

  try {
    const res = await axios.post<AuthTokens>(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: 10000 }
    );
    updateStoredAccessToken(res.data.access_token);
    updateStoredRefreshToken(res.data.refresh_token);
    return res.data.access_token;
  } catch {
    clearStoredAuth();
    return null;
  }
}
