import { StateCreator } from 'zustand';
import {
  DocumentResponse,
  SimulationResponse,
  DecisionResponse,
  Runbook,
  IncidentMemory,
  ComplianceReport,
  ExplanationResponse,
} from '../../types/apex';
import { ComplianceStandard, MOCK_COMPLIANCE } from '../../services/api';

export interface DataSlice {
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

  complianceStandards: ComplianceStandard[];
}

export const createDataSlice: StateCreator<DataSlice> = (set) => ({
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

  complianceStandards: MOCK_COMPLIANCE,
});
