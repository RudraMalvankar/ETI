import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apexApi,
  type GraphState,
  type Runbook,
  type ComplianceReport,
  type SimulationResult,
  type DecisionResult,
  type MemoryEntry,
  type SearchQuery,
  type CopilotAnswer,
  type IncidentSummary,
} from '../services/api';
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  type DocumentItem,
} from '../services/apexServices';

// ── Graph ─────────────────────────────────────────────────────

export function useGraphState() {
  return useQuery<GraphState>({
    queryKey: ['graph'],
    queryFn: () => apexApi.getGraphState(false),
  });
}

// ── Runbook ───────────────────────────────────────────────────

export function useRunbook() {
  return useQuery<Runbook>({
    queryKey: ['runbook'],
    queryFn: () => apexApi.getRunbook(),
  });
}

// ── Compliance ────────────────────────────────────────────────

export function useComplianceReport() {
  return useQuery<ComplianceReport>({
    queryKey: ['compliance'],
    queryFn: () => apexApi.getComplianceReport(),
  });
}

// ── Simulation ────────────────────────────────────────────────

export function useRunSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      failed_asset: string;
      failure_type: string;
      initial_telemetry: Record<string, number>;
      operating_mode?: string;
    }) => apexApi.runSimulation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] });
    },
  });
}

// ── Decision ──────────────────────────────────────────────────

export function useMakeDecision() {
  return useMutation({
    mutationFn: (context: {
      query: string;
      graph_state: GraphState;
      compliance_report: ComplianceReport;
      current_mode: string;
    }) => apexApi.makeDecision(context),
  });
}

// ── Memory ────────────────────────────────────────────────────

export function useMemoryHistory() {
  return useQuery<MemoryEntry[]>({
    queryKey: ['memory'],
    queryFn: () => apexApi.getMemoryHistory(),
  });
}

export function useMemorySearch() {
  return useMutation({
    mutationFn: (query: string) => apexApi.searchMemory(query),
  });
}

export function useMemoryPatterns() {
  return useQuery({
    queryKey: ['memory', 'patterns'],
    queryFn: () => apexApi.getPatterns(),
  });
}

// ── Copilot ───────────────────────────────────────────────────

export function useCopilotSearch() {
  return useMutation({
    mutationFn: (query: string) => apexApi.searchCopilot(query),
  });
}

// ── Incident History ──────────────────────────────────────────

export function useIncidentHistory() {
  return useQuery<IncidentSummary[]>({
    queryKey: ['incidents'],
    queryFn: () => apexApi.getIncidentHistory(),
  });
}

// ── Documents ─────────────────────────────────────────────────

export function useDocuments() {
  return useQuery<DocumentItem[]>({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) =>
      uploadDocument(file, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// ── Graph Search ──────────────────────────────────────────────

export function useGraphSearch() {
  return useMutation({
    mutationFn: (query: string) => apexApi.searchGraph(query),
  });
}

// ── Explainability ────────────────────────────────────────────

export function useExplainability(decisionId: string | null) {
  return useQuery({
    queryKey: ['explainability', decisionId],
    queryFn: () => apexApi.getExplainability(decisionId!),
    enabled: !!decisionId,
  });
}
