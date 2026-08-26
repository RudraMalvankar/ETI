import { StateCreator } from 'zustand';
import { AuthProfile } from '../../types/apex';
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
} from '../../services/authStorage';

export interface AuthSlice {
  isAuthenticated: boolean;
  currentUser: AuthProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuthSession: (payload: {
    user: AuthProfile;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setCurrentUser: (user: AuthProfile | null) => void;
  clearAuthSession: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  isAuthenticated: Boolean(getStoredAccessToken()),
  currentUser: getStoredUser(),
  accessToken: getStoredAccessToken(),
  refreshToken: getStoredRefreshToken(),

  setAuthSession: ({ user, accessToken, refreshToken }) =>
    set({
      isAuthenticated: true,
      currentUser: user,
      accessToken,
      refreshToken,
    }),

  setCurrentUser: (currentUser) => set({ currentUser }),

  clearAuthSession: () => {
    clearStoredAuth();
    set({
      isAuthenticated: false,
      currentUser: null,
      accessToken: null,
      refreshToken: null,
    });
  },
});
