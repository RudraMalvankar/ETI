export interface IngestedChunk {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  page_number?: number | null;
  asset_id?: string | null;
  title?: string | null;
  section?: string | null;
  text: string;
  token_count?: number;
  metadata?: Record<string, any>;
}

export interface IngestedDocumentDetail {
  document_id: string;
  filename: string;
  file_type: string;
  status: string;
  chunks: IngestedChunk[];
  uploaded_at?: string;
  error_message?: string | null;
}

export interface AuthProfile {
  username: string;
  role: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
}

export interface DocumentResponse {
  document_id: string;
  filename: string;
  status: string;
  chunk_count: number;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  score: number;
  text_snippet: string;
  asset_id?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query_time_ms: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'pump' | 'valve' | 'pipeline' | 'heat_exchanger' | 'sensor' | 'asset';
  status: 'nominal' | 'warning' | 'critical' | 'isolated';
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SimulationRequestPayload {
  failed_asset: string;
  failure_type: string;
  initial_telemetry?: Record<string, any>;
  timestamp?: string;
  operating_mode?: string;
}

export interface SimulationRiskProfile {
  safety_risk: number;
  operational_risk: number;
  financial_risk: number;
  environmental_risk: number;
  overall_score: number;
}

export interface Scenario {
  scenario_id: string;
  name: string;
  affected_assets: string[];
  system_state_snapshot: Record<string, any>;
  safety_level: string;
  risk_score: SimulationRiskProfile;
  estimated_downtime_hours: number;
  estimated_cost_usd: number;
  propagation_path: Array<Record<string, string>>;
}

export interface SimulationResponse {
  simulation_id: string;
  request: SimulationRequestPayload;
  scenarios: Scenario[];
}

export interface DecisionCitation {
  document_id: string;
  chunk_id: string;
  text_snippet: string;
}

export interface DecisionTrace {
  documents_used: number | string[];
  graph_nodes_traversed: number | string[];
  selected_scenario: string;
  citations_verified: number | string[];
  confidence: number;
}

export interface DecisionResponse {
  recommended_strategy: string;
  alternative_strategies: string[];
  reasoning: string;
  supporting_citations: DecisionCitation[];
  confidence_score: number;
  affected_assets: string[];
  estimated_risk_reduction: number;
  estimated_cost: number;
  estimated_downtime: number;
  decision_trace: DecisionTrace;
}

export interface RunbookStep {
  step_id: string;
  title: string;
  description: string;
  target_asset: string;
  priority: number;
  status: string;
  required_tools: string[];
  safety_requirements: string[];
  document_citations: Array<Record<string, string>>;
  estimated_duration: number;
  prerequisites: string[];
}

export interface Runbook {
  runbook_id: string;
  failed_asset: string;
  failure_type: string;
  status: string;
  steps: RunbookStep[];
  affected_assets: string[];
  total_estimated_duration: number;
  update_history: any[];
  is_regenerated: boolean;
}

export interface IncidentMemory {
  incident_id: string;
  failed_asset: string;
  failure_type: string;
  graph_snapshot: Record<string, any>;
  simulation_data: Record<string, any>;
  decision_data: Record<string, any>;
  runbook_history: any[];
  technician_feedback: any[];
  regenerated_runbooks?: any[];
  outcome: string;
  timestamp: string;
}

export interface TrendAnalysis {
  total_incidents: number;
  most_common_failure_type: string;
  most_vulnerable_asset: string;
  failure_distribution: Record<string, number>;
  asset_vulnerability_ranking: Record<string, number>;
  resolution_rate: number;
}

export interface ExplanationResponse {
  decision_trace: {
    documents_used: any[];
    graph_nodes_traversed: any[];
    selected_scenario: string;
    simulation_id: string;
    citations_verified: any[];
    confidence: number;
  };
  graph_evidence: any[];
  simulation_evidence: any[];
  document_evidence: any[];
  reasoning_summary: string;
}

export interface ComplianceReport {
  report_id: string;
  incident_summary: string;
  root_cause: string;
  timeline: Array<{ time: string; event: string }>;
  graph_snapshot: Record<string, any>;
  simulation_results: Record<string, any>;
  decision_trace: Record<string, any>;
  supporting_evidence: any[];
  runbook_history: any[];
  technician_actions: any[];
  compliance_checklist: string[];
  final_resolution: string;
}

export interface ProviderStatus {
  ai_provider: string;
  embedding_provider: string;
  ocr_provider: string;
  qdrant_mode: string;
  environment: string;
  app_mode: string;
  telemetry_enabled: boolean;
}

export interface PlatformSettings {
  ai_provider: string;
  embedding_provider: string;
  ocr_provider: string;
  confidence_threshold: number;
  top_k: number;
  rerank_top_k: number;
  enable_reranking: boolean;
  theme: string;
  notifications_enabled: boolean;
  api_base_url: string;
  environment_status: string;
  notification_channels: string[];
  provider_status: ProviderStatus;
  updated_by?: string | null;
  updated_at?: string | null;
}

export interface PlatformSettingsEnvelope {
  settings: PlatformSettings;
  available_ai_providers: string[];
  available_embedding_providers: string[];
  available_ocr_providers: string[];
  effective_runtime: Record<string, string | number | boolean>;
}
