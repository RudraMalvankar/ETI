import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import {
  listDocuments,
  uploadDocument,
  getDocumentDetails,
  getGraph,
  buildGraph,
  vectorSearch,
  getIncidents,
  getComplianceReport,
  getRunbook,
  runSimulation,
  evaluateDecision,
} from '../services/apexServices';
import type {
  DocumentResponse,
  GraphData,
  ComplianceReport,
  Runbook,
  IncidentMemory,
} from '../types/apex';

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
    mutationFn: (documentId: string) =>
      apiClient.delete(`/documents/${documentId}`).then(() => {}),
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
    queryFn: getIncidents,
  });
}

// ── Compliance ────────────────────────────────────────────────

export function useComplianceReport(reportId: string | null) {
  return useQuery<ComplianceReport>({
    queryKey: ['compliance', reportId],
    queryFn: () => getComplianceReport(reportId!),
    enabled: !!reportId,
  });
}

// ── Runbook ───────────────────────────────────────────────────

export function useRunbook(runbookId: string | null) {
  return useQuery<Runbook>({
    queryKey: ['runbook', runbookId],
    queryFn: () => getRunbook(runbookId!),
    enabled: !!runbookId,
  });
}

// ── Simulation ────────────────────────────────────────────────

export function useRunSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      failed_asset: string;
      failure_type: string;
    }) => runSimulation(payload.failed_asset, payload.failure_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] });
    },
  });
}

// ── Decision ──────────────────────────────────────────────────

export function useMakeDecision() {
  return useMutation({
    mutationFn: (payload: {
      failed_asset: string;
      failure_type: string;
      simulation_id: string;
    }) => evaluateDecision(payload.failed_asset, payload.failure_type, payload.simulation_id),
  });
}
