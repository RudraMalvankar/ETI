import { create } from 'zustand';
import {
  DocumentResponse,
  SimulationResponse,
  DecisionResponse,
  Runbook,
  IncidentMemory,
  ComplianceReport,
  ExplanationResponse
} from '../types/apex';

export type BackendConnectionState = 'connected' | 'demo' | 'offline';

interface ApexState {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Backend Health
  connectionState: BackendConnectionState;
  setConnectionState: (state: BackendConnectionState) => void;
  apiBaseUrl: string;

  // Search
  globalQuery: string;
  setGlobalQuery: (query: string) => void;

  // Workflow Active Context
  activeDocument: DocumentResponse | null;
  setActiveDocument: (doc: DocumentResponse | null) => void;

  activeAssetId: string;
  setActiveAssetId: (assetId: string) => void;

  activeFailureType: string;
  setActiveFailureType: (failureType: string) => void;

  currentSimulation: SimulationResponse | null;
  setCurrentSimulation: (sim: SimulationResponse | null) => void;

  currentDecision: DecisionResponse | null;
  setCurrentDecision: (decision: DecisionResponse | null) => void;

  currentRunbook: Runbook | null;
  setCurrentRunbook: (runbook: Runbook | null) => void;

  currentMemory: IncidentMemory | null;
  setCurrentMemory: (memory: IncidentMemory | null) => void;

  currentExplanation: ExplanationResponse | null;
  setCurrentExplanation: (exp: ExplanationResponse | null) => void;

  currentReport: ComplianceReport | null;
  setCurrentReport: (report: ComplianceReport | null) => void;

  // History list
  incidentsList: IncidentMemory[];
  setIncidentsList: (list: IncidentMemory[]) => void;
}

export const useApexStore = create<ApexState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isDarkMode: true,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  connectionState: 'connected',
  setConnectionState: (connectionState) => set({ connectionState }),
  apiBaseUrl: 'http://localhost:8000/api/v1',

  globalQuery: '',
  setGlobalQuery: (globalQuery) => set({ globalQuery }),

  activeDocument: null,
  setActiveDocument: (activeDocument) => set({ activeDocument }),

  activeAssetId: 'P-101',
  setActiveAssetId: (activeAssetId) => set({ activeAssetId }),

  activeFailureType: 'bearing_overheat',
  setActiveFailureType: (activeFailureType) => set({ activeFailureType }),

  currentSimulation: null,
  setCurrentSimulation: (currentSimulation) => set({ currentSimulation }),

  currentDecision: null,
  setCurrentDecision: (currentDecision) => set({ currentDecision }),

  currentRunbook: null,
  setCurrentRunbook: (currentRunbook) => set({ currentRunbook }),

  currentMemory: null,
  setCurrentMemory: (currentMemory) => set({ currentMemory }),

  currentExplanation: null,
  setCurrentExplanation: (currentExplanation) => set({ currentExplanation }),

  currentReport: null,
  setCurrentReport: (currentReport) => set({ currentReport }),

  incidentsList: [],
  setIncidentsList: (incidentsList) => set({ incidentsList }),
}));
