import { AuthProfile } from '../types/apex';

const USER_KEY = 'apex.user';

export function getStoredUser(): AuthProfile | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthProfile;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function storeUser(user: AuthProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(USER_KEY);
}
