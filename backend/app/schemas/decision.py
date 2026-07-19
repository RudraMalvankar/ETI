from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DecisionRequest(BaseModel):
    failed_asset: str
    failure_type: str
    simulation_id: str

class Citation(BaseModel):
    document_id: str
    chunk_id: str
    text_snippet: str

class DecisionResponse(BaseModel):
    recommended_strategy: str
    alternative_strategies: List[str]
    reasoning: str
    supporting_citations: List[Citation]
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    affected_assets: List[str]
    estimated_risk_reduction: float
    estimated_cost: float
    estimated_downtime: float
