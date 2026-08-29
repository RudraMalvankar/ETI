import { StateCreator } from 'zustand';
import { AuthProfile } from '../../types/apex';
import { clearStoredAuth, getStoredUser, storeUser } from '../../services/authStorage';

export interface AuthSlice {
  isAuthenticated: boolean;
  currentUser: AuthProfile | null;
  setAuthSession: (payload: { user: AuthProfile }) => void;
  setCurrentUser: (user: AuthProfile | null) => void;
  clearAuthSession: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  isAuthenticated: Boolean(getStoredUser()),
  currentUser: getStoredUser(),

  setAuthSession: ({ user }) => {
    storeUser(user);
    set({
      isAuthenticated: true,
      currentUser: user,
    });
  },

  setCurrentUser: (currentUser) => set({ currentUser }),

  clearAuthSession: () => {
    clearStoredAuth();
    set({
      isAuthenticated: false,
      currentUser: null,
    });
  },
});
