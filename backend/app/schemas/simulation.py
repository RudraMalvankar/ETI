from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class SimulationRequest(BaseModel):
    failed_asset: str
    failure_type: str
    initial_telemetry: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    operating_mode: str = "normal"

class RiskProfile(BaseModel):
    safety_risk: float
    operational_risk: float
    financial_risk: float
    environmental_risk: float
    overall_score: float

class ScenarioResult(BaseModel):
    scenario_id: str
    name: str
    affected_assets: List[str]
    propagation_path: List[Dict[str, str]]
    risk_score: RiskProfile
    estimated_downtime_hours: float
    estimated_cost_usd: float
    safety_level: str
    system_state_snapshot: Dict[str, Any]

class SimulationResponse(BaseModel):
    simulation_id: str
    request: SimulationRequest
    scenarios: List[ScenarioResult]

class SimulationStatistics(BaseModel):
    total_simulations: int
    total_scenarios_generated: int
    average_downtime: float
