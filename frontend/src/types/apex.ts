export interface IngestedChunk {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  text: string;
  token_count: number;
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

export interface Scenario {
  name: string;
  affected_assets: string[];
  estimated_downtime_hours: number;
  estimated_cost_usd: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  propagation_path: string[];
}

export interface SimulationResponse {
  simulation_id: string;
  failed_asset: string;
  failure_type: string;
  scenarios: Scenario[];
  timestamp: string;
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
  step_number: number;
  title: string;
  action: string;
  target_asset: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required_tools: string[];
  safety_requirements: string[];
  citations: string[];
  estimated_duration_minutes: number;
  feedback_notes?: string;
}

export interface Runbook {
  runbook_id: string;
  simulation_id: string;
  status: 'active' | 'completed' | 'failed' | 'regenerated';
  steps: RunbookStep[];
  update_history: any[];
  is_regenerated: boolean;
  timestamp: string;
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
