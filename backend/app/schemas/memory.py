from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime

class IncidentMemory(BaseModel):
    incident_id: str
    failed_asset: str
    failure_type: str
    graph_snapshot: Dict[str, Any] = Field(default_factory=dict)
    simulation_data: Dict[str, Any] = Field(default_factory=dict)
    decision_data: Dict[str, Any] = Field(default_factory=dict)
    runbook_history: List[Dict[str, Any]] = Field(default_factory=list)
    technician_feedback: List[Any] = Field(default_factory=list)
    regenerated_runbooks: List[Dict[str, Any]] = Field(default_factory=list)
    outcome: str = "Resolved"
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())

class StoreMemoryRequest(BaseModel):
    failed_asset: str
    failure_type: str
    simulation_id: Optional[str] = ""
    runbook_id: Optional[str] = ""
    decision_data: Optional[Dict[str, Any]] = None
    outcome: Optional[str] = "Resolved"
    technician_feedback: Optional[List[Any]] = None

class SearchMemoryRequest(BaseModel):
    query: str
    top_k: int = 5
