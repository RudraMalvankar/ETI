import { apiClient } from './apiClient';
import {
  DocumentResponse,
  IngestedDocumentDetail,
  SearchResponse,
  GraphData,
  SimulationResponse,
  DecisionResponse,
  Runbook,
  IncidentMemory,
  TrendAnalysis,
  ExplanationResponse,
  ComplianceReport,
  PlatformSettings,
  PlatformSettingsEnvelope,
} from '../types/apex';

// --- DOCUMENTS ---
export async function uploadDocument(file: File): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function indexDocument(
  document_id: string
): Promise<{ message: string; chunk_count: number }> {
  const res = await apiClient.post('/documents/index', { document_id });
  return res.data;
}

export async function listDocuments(): Promise<DocumentResponse[]> {
  const res = await apiClient.get('/documents/');
  return res.data;
}

export async function getDocumentDetails(documentId: string): Promise<IngestedDocumentDetail> {
  const res = await apiClient.get(`/documents/${documentId}`);
  return res.data;
}

export async function vectorSearch(query: string, top_k: number = 5): Promise<SearchResponse> {
  const res = await apiClient.post('/search/', { query, top_k });
  return res.data;
}

// --- KNOWLEDGE GRAPH ---
export async function buildGraph(
  graphData: any
): Promise<{ status: string; node_count: number; edge_count: number }> {
  const res = await apiClient.post('/graph/build', graphData);
  return res.data;
}

export async function getGraph(): Promise<GraphData> {
  const res = await apiClient.get('/graph/');
  return res.data;
}

export async function getGraphNode(nodeId: string): Promise<Record<string, any>> {
  const res = await apiClient.get(`/graph/node/${nodeId}`);
  return res.data;
}

export async function getGraphStatistics(): Promise<{
  total_nodes: number;
  total_edges: number;
  connected_components: number;
  is_directed_acyclic_graph: boolean;
  density: number;
}> {
  const res = await apiClient.get('/graph/statistics');
  return res.data;
}

export async function getBlastRadius(assetId: string): Promise<{
  failed_asset: string;
  affected_assets: string[];
  propagation_path: Array<Record<string, string>>;
  max_distance: number;
  severity: string;
}> {
  const res = await apiClient.post('/graph/blast-radius', { failed_asset: assetId });
  return res.data;
}

// --- SHADOW SIMULATION ---
export async function runSimulation(
  failed_asset: string,
  failure_type: string
): Promise<SimulationResponse> {
  const res = await apiClient.post('/simulation/run', { failed_asset, failure_type });
  return res.data;
}

// --- AI DECISION ---
export async function evaluateDecision(
  failed_asset: string,
  failure_type: string,
  simulation_id: string
): Promise<DecisionResponse> {
  const res = await apiClient.post('/decision/recommend', {
    failed_asset,
    failure_type,
    simulation_id,
  });
  return res.data;
}

// --- DYNAMIC RUNBOOK ---
export async function generateRunbook(
  decision_payload: any,
  simulation_id: string
): Promise<Runbook> {
  const res = await apiClient.post('/runbook/generate', { decision_payload, simulation_id });
  return res.data;
}

export async function getRunbook(runbook_id: string): Promise<Runbook> {
  const res = await apiClient.get(`/runbook/${runbook_id}`);
  return res.data;
}

export async function updateRunbookStep(
  runbook_id: string,
  step_id: string,
  status: string,
  feedback_notes?: string
): Promise<Runbook> {
  const res = await apiClient.put(`/runbook/${runbook_id}/step/${step_id}`, {
    status,
    feedback_notes,
  });
  return res.data;
}

export async function regenerateRunbook(runbook_id: string): Promise<Runbook> {
  const res = await apiClient.post(`/runbook/${runbook_id}/regenerate`);
  return res.data;
}

// --- OPERATIONAL MEMORY ---
export async function storeMemory(payload: {
  failed_asset: string;
  failure_type: string;
  simulation_id?: string;
  runbook_id?: string;
  decision_data?: any;
  outcome?: string;
  technician_feedback?: any[];
}): Promise<IncidentMemory> {
  const res = await apiClient.post('/memory/store', payload);
  return res.data;
}

export async function getIncidents(): Promise<IncidentMemory[]> {
  const res = await apiClient.get('/memory/incidents');
  return res.data;
}

export async function getIncidentById(incident_id: string): Promise<IncidentMemory> {
  const res = await apiClient.get(`/memory/${incident_id}`);
  return res.data;
}

export async function searchMemory(query: string, top_k: number = 5): Promise<IncidentMemory[]> {
  const res = await apiClient.post('/memory/search', { query, top_k });
  return res.data;
}

export async function getMemoryTrends(): Promise<TrendAnalysis> {
  const res = await apiClient.get('/memory/trends');
  return res.data;
}

// --- EXPLAINABILITY ---
export async function explainDecision(context: any): Promise<ExplanationResponse> {
  const res = await apiClient.post('/explainability/explain', context);
  return res.data;
}

// --- COMPLIANCE ---
export async function generateComplianceReport(incident_id: string): Promise<ComplianceReport> {
  const res = await apiClient.post('/compliance/report', { incident_id });
  return res.data;
}

export async function getComplianceReport(report_id: string): Promise<ComplianceReport> {
  const res = await apiClient.get(`/compliance/${report_id}`);
  return res.data;
}

export async function exportCompliancePdf(report_id: string): Promise<Blob> {
  const res = await apiClient.post(
    '/compliance/export/pdf',
    { report_id },
    { responseType: 'blob' }
  );
  return new Blob([res.data], { type: 'application/pdf' });
}

export async function exportComplianceDocx(report_id: string): Promise<Blob> {
  const res = await apiClient.post(
    '/compliance/export/docx',
    { report_id },
    { responseType: 'blob' }
  );
  return new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

// --- PLATFORM SETTINGS ---
export async function getPlatformSettings(): Promise<PlatformSettingsEnvelope> {
  const res = await apiClient.get('/settings/');
  return res.data;
}

export async function updatePlatformSettings(
  payload: Omit<PlatformSettings, 'provider_status' | 'updated_by' | 'updated_at'>
): Promise<PlatformSettingsEnvelope> {
  const res = await apiClient.put('/settings/', payload);
  return res.data;
}
