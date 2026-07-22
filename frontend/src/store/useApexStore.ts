import { create } from 'zustand';
import { API_BASE_URL } from '../services/apiBase';
import {
  AuthProfile,
  DocumentResponse,
  SimulationResponse,
  DecisionResponse,
  Runbook,
  IncidentMemory,
  ComplianceReport,
  ExplanationResponse,
} from '../types/apex';
import {
  PlantNode,
  PlantEdge,
  RunbookData,
  ComplianceStandard,
  MOCK_GRAPH_INITIAL,
  MOCK_GRAPH_REROUTED,
  MOCK_RUNBOOK_INITIAL,
  MOCK_COMPLIANCE,
  apexApi,
} from '../services/api';
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
} from '../services/authStorage';

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

interface ApexState {
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

  // Navigation & Legacy Properties
  activeTab: string;
  setActiveTab: (tab: string) => void;

  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleTheme: () => void;

  connectionState: BackendConnectionState;
  setConnectionState: (state: BackendConnectionState) => void;
  apiBaseUrl: string;
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;

  globalQuery: string;
  setGlobalQuery: (query: string) => void;

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

  incidentsList: IncidentMemory[];
  setIncidentsList: (list: IncidentMemory[]) => void;

  // New Decision Engine State
  isAnomalyActive: boolean;
  isRerouted: boolean;
  viewMode: 'desktop' | 'rugged_mobile';
  selectedNode: PlantNode | null;

  isCopilotOpen: boolean;
  isComplianceModalOpen: boolean;
  isTagInspectorOpen: boolean;

  nodes: PlantNode[];
  edges: PlantEdge[];
  runbook: RunbookData;
  complianceStandards: ComplianceStandard[];

  triggerAnomaly: () => void;
  resetPlantState: () => void;
  setViewMode: (mode: 'desktop' | 'rugged_mobile') => void;
  setSelectedNode: (node: PlantNode | null) => void;
  toggleCopilot: (open?: boolean) => void;
  toggleComplianceModal: (open?: boolean) => void;
  toggleTagInspector: (open?: boolean) => void;

  toggleStepCompletion: (stepId: string) => void;
  toggleLotoStatus: (stepId: string) => void;
  markStepFailedAndReroute: (stepId: string) => Promise<void>;
}

export const useApexStore = create<ApexState>(set => ({
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
  setCurrentUser: currentUser => set({ currentUser }),
  clearAuthSession: () => {
    clearStoredAuth();
    set({
      isAuthenticated: false,
      currentUser: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  // Legacy Store State
  activeTab: 'dashboard',
  setActiveTab: tab => set({ activeTab: tab }),

  isDarkMode: getInitialTheme(),
  setDarkMode: isDarkMode => {
    localStorage.setItem(THEME_STORAGE_KEY, String(isDarkMode));
    set({ isDarkMode });
  },
  toggleTheme: () =>
    set(state => {
      const next = !state.isDarkMode;
      localStorage.setItem(THEME_STORAGE_KEY, String(next));
      return { isDarkMode: next };
    }),

  connectionState: 'connected',
  setConnectionState: connectionState => set({ connectionState }),
  apiBaseUrl: API_BASE_URL,
  confidenceThreshold: getInitialConfidenceThreshold(),
  setConfidenceThreshold: confidenceThreshold => {
    localStorage.setItem(CONFIDENCE_STORAGE_KEY, String(confidenceThreshold));
    set({ confidenceThreshold });
  },

  globalQuery: '',
  setGlobalQuery: globalQuery => set({ globalQuery }),

  activeDocument: null,
  setActiveDocument: activeDocument => set({ activeDocument }),

  activeAssetId: 'P-101',
  setActiveAssetId: activeAssetId => set({ activeAssetId }),

  activeFailureType: 'bearing_overheat',
  setActiveFailureType: activeFailureType => set({ activeFailureType }),

  currentSimulation: null,
  setCurrentSimulation: currentSimulation => set({ currentSimulation }),

  currentDecision: null,
  setCurrentDecision: currentDecision => set({ currentDecision }),

  currentRunbook: null,
  setCurrentRunbook: currentRunbook => set({ currentRunbook }),

  currentMemory: null,
  setCurrentMemory: currentMemory => set({ currentMemory }),

  currentExplanation: null,
  setCurrentExplanation: currentExplanation => set({ currentExplanation }),

  currentReport: null,
  setCurrentReport: currentReport => set({ currentReport }),

  incidentsList: [],
  setIncidentsList: incidentsList => set({ incidentsList }),

  // New Decision Engine State
  isAnomalyActive: true,
  isRerouted: false,
  viewMode: 'desktop',
  selectedNode: MOCK_GRAPH_INITIAL.nodes[0],

  isCopilotOpen: false,
  isComplianceModalOpen: false,
  isTagInspectorOpen: false,

  nodes: MOCK_GRAPH_INITIAL.nodes,
  edges: MOCK_GRAPH_INITIAL.edges,
  runbook: MOCK_RUNBOOK_INITIAL,
  complianceStandards: MOCK_COMPLIANCE,

  triggerAnomaly: () => {
    set({
      isAnomalyActive: true,
      isRerouted: false,
      nodes: MOCK_GRAPH_INITIAL.nodes,
      edges: MOCK_GRAPH_INITIAL.edges,
      runbook: MOCK_RUNBOOK_INITIAL,
      selectedNode: MOCK_GRAPH_INITIAL.nodes[0],
    });
  },

  resetPlantState: () => {
    const nominalNodes = MOCK_GRAPH_INITIAL.nodes.map(n => ({
      ...n,
      status: 'nominal' as const,
      telemetry: {
        pressure: n.type === 'reactor' ? '11.8 Bar' : undefined,
        temperature: n.type === 'reactor' ? '210°C' : undefined,
        flow: n.type === 'pump' ? '400 L/min' : 'Nominal',
      },
    }));
    const nominalEdges = MOCK_GRAPH_INITIAL.edges.map(e => ({
      ...e,
      status: 'nominal' as const,
    }));

    set({
      isAnomalyActive: false,
      isRerouted: false,
      nodes: nominalNodes,
      edges: nominalEdges,
      selectedNode: nominalNodes[0],
    });
  },

  setViewMode: viewMode => set({ viewMode }),
  setSelectedNode: selectedNode => set({ selectedNode, isTagInspectorOpen: true }),

  toggleCopilot: open =>
    set(state => ({ isCopilotOpen: open !== undefined ? open : !state.isCopilotOpen })),
  toggleComplianceModal: open =>
    set(state => ({
      isComplianceModalOpen: open !== undefined ? open : !state.isComplianceModalOpen,
    })),
  toggleTagInspector: open =>
    set(state => ({ isTagInspectorOpen: open !== undefined ? open : !state.isTagInspectorOpen })),

  toggleStepCompletion: stepId => {
    set(state => {
      const updatedSteps = state.runbook.steps.map(step =>
        step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
      );
      return {
        runbook: {
          ...state.runbook,
          steps: updatedSteps,
        },
      };
    });
  },

  toggleLotoStatus: stepId => {
    set(state => {
      const updatedSteps = state.runbook.steps.map(step => {
        if (step.id === stepId) {
          const nextStatus: 'pending' | 'verified' | 'skipped' =
            step.lotoStatus === 'pending' ? 'verified' : 'pending';
          return { ...step, lotoStatus: nextStatus };
        }
        return step;
      });
      return {
        runbook: {
          ...state.runbook,
          steps: updatedSteps,
        },
      };
    });
  },

  markStepFailedAndReroute: async () => {
    const reroutedRunbook = await apexApi.triggerStepReroute();
    set({
      isRerouted: true,
      nodes: MOCK_GRAPH_REROUTED.nodes,
      edges: MOCK_GRAPH_REROUTED.edges,
      runbook: reroutedRunbook,
      selectedNode: MOCK_GRAPH_REROUTED.nodes[2],
    });
  },
}));
