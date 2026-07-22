from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RunbookStep(BaseModel):
    step_id: str
    title: str
    description: str
    target_asset: str
    priority: int
    estimated_duration: float
    safety_requirements: List[str] = Field(default_factory=list)
    required_tools: List[str] = Field(default_factory=list)
    document_citations: List[Dict[str, str]] = Field(default_factory=list)
    status: str = "pending" # pending, completed, failed
    prerequisites: List[str] = Field(default_factory=list)

class RunbookRequest(BaseModel):
    decision_payload: Dict[str, Any]
    simulation_id: str

class Runbook(BaseModel):
    runbook_id: str
    failed_asset: str = "Unknown"
    failure_type: str = "Unknown"
    status: str = "active"
    is_regenerated: bool = False
    steps: List[RunbookStep]
    affected_assets: List[str]
    total_estimated_duration: float
    update_history: List[str] = Field(default_factory=list)

class FeedbackRequest(BaseModel):
    status: str
    feedback_notes: str

class RunbookStatistics(BaseModel):
    total_runbooks: int
    active_runbooks: int
    completed_runbooks: int
    total_regenerations: int
