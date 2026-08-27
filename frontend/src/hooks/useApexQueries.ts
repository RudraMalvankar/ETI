import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listDocuments,
  uploadDocument,
  getDocumentDetails,
  deleteDocument,
  getGraph,
  buildGraph,
  vectorSearch,
  getIncidents,
  getMemoryEntries,
  getComplianceReport,
  getRunbook,
  triggerSimulation,
  makeDecision,
  type DocumentResponse,
  type GraphData,
  type ComplianceReport,
  type Runbook,
  type IncidentMemory,
} from '../services/apexServices';

// ── Documents ─────────────────────────────────────────────────

export function useDocuments() {
  return useQuery<DocumentResponse[]>({
    queryKey: ['documents'],
    queryFn: listDocuments,
  });
}

export function useDocumentDetails(documentId: string | null) {
  return useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => getDocumentDetails(documentId!),
    enabled: !!documentId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
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

// ── Graph ─────────────────────────────────────────────────────

export function useGraph() {
  return useQuery<GraphData>({
    queryKey: ['graph'],
    queryFn: getGraph,
  });
}

export function useBuildGraph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (graphData: any) => buildGraph(graphData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] });
    },
  });
}

// ── Search ────────────────────────────────────────────────────

export function useVectorSearch() {
  return useMutation({
    mutationFn: ({ query, top_k }: { query: string; top_k?: number }) =>
      vectorSearch(query, top_k),
  });
}

// ── Incidents ─────────────────────────────────────────────────

export function useIncidents() {
  return useQuery<IncidentMemory[]>({
    queryKey: ['incidents'],
    queryFn: getIncidents,
  });
}

// ── Memory ────────────────────────────────────────────────────

export function useMemoryEntries() {
  return useQuery({
    queryKey: ['memory'],
    queryFn: getMemoryEntries,
  });
}

// ── Compliance ────────────────────────────────────────────────

export function useComplianceReport() {
  return useQuery<ComplianceReport>({
    queryKey: ['compliance'],
    queryFn: getComplianceReport,
  });
}

// ── Runbook ───────────────────────────────────────────────────

export function useRunbook() {
  return useQuery<Runbook>({
    queryKey: ['runbook'],
    queryFn: getRunbook,
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
    }) => triggerSimulation(payload),
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
      graph_state: GraphData;
      compliance_report: ComplianceReport;
      current_mode: string;
    }) => makeDecision(context),
  });
}
