import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await axios.get('http://localhost:8000/health', { timeout: 3000 });
    return res.data?.status === 'ok';
  } catch (err) {
    return false;
  }
}
