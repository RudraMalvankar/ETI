import { apiClient } from './apiClient';
import { clearStoredAuth, storeUser } from './authStorage';
import { AuthProfile } from '../types/apex';

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
  const tokenRes = await apiClient.post('/auth/login', payload);
  const profile: AuthProfile = {
    username: payload.username,
    role: tokenRes.data.role,
  };

  storeUser(profile);
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
