from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ExtendedDecisionTrace(BaseModel):
    documents_used: List[Any] = Field(default_factory=list)
    graph_nodes_traversed: List[Any] = Field(default_factory=list)
    selected_scenario: str = ""
    simulation_id: str = ""
    citations_verified: List[Any] = Field(default_factory=list)
    confidence: float = 0.0

class ExplanationResponse(BaseModel):
    decision_trace: ExtendedDecisionTrace
    graph_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    simulation_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    document_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    reasoning_summary: str = ""
