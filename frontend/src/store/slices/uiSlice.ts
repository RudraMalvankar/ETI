import { StateCreator } from 'zustand';

export type BackendConnectionState = 'connected' | 'demo' | 'offline';

const THEME_STORAGE_KEY = 'apex.theme.dark';
const CONFIDENCE_STORAGE_KEY = 'apex.confidence.threshold';

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

function getInitialConfidenceThreshold(): number {
  const stored = localStorage.getItem(CONFIDENCE_STORAGE_KEY);
  const parsed = stored ? Number(stored) : NaN;
  return Number.isFinite(parsed) ? parsed : 85;
}

export interface UISlice {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleTheme: () => void;

  connectionState: BackendConnectionState;
  setConnectionState: (state: BackendConnectionState) => void;

  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;

  globalQuery: string;
  setGlobalQuery: (query: string) => void;

  viewMode: 'desktop' | 'rugged_mobile';
  setViewMode: (mode: 'desktop' | 'rugged_mobile') => void;

  isCopilotOpen: boolean;
  isComplianceModalOpen: boolean;
  isTagInspectorOpen: boolean;
  toggleCopilot: (open?: boolean) => void;
  toggleComplianceModal: (open?: boolean) => void;
  toggleTagInspector: (open?: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isDarkMode: getInitialTheme(),
  setDarkMode: (isDarkMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, String(isDarkMode));
    set({ isDarkMode });
  },
  toggleTheme: () =>
    set((state) => {
      const next = !state.isDarkMode;
      localStorage.setItem(THEME_STORAGE_KEY, String(next));
      return { isDarkMode: next };
    }),

  connectionState: 'connected',
  setConnectionState: (connectionState) => set({ connectionState }),

  confidenceThreshold: getInitialConfidenceThreshold(),
  setConfidenceThreshold: (confidenceThreshold) => {
    localStorage.setItem(CONFIDENCE_STORAGE_KEY, String(confidenceThreshold));
    set({ confidenceThreshold });
  },

  globalQuery: '',
  setGlobalQuery: (globalQuery) => set({ globalQuery }),

  viewMode: 'desktop',
  setViewMode: (viewMode) => set({ viewMode }),

  isCopilotOpen: false,
  isComplianceModalOpen: false,
  isTagInspectorOpen: false,

  toggleCopilot: (open) =>
    set((state) => ({ isCopilotOpen: open !== undefined ? open : !state.isCopilotOpen })),
  toggleComplianceModal: (open) =>
    set((state) => ({
      isComplianceModalOpen: open !== undefined ? open : !state.isComplianceModalOpen,
    })),
  toggleTagInspector: (open) =>
    set((state) => ({ isTagInspectorOpen: open !== undefined ? open : !state.isTagInspectorOpen })),
});
