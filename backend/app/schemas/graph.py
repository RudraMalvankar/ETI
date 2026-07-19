from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class GraphNode(BaseModel):
    node_id: str
    asset_id: str
    asset_type: str
    status: str = "operational"
    criticality: str = "medium"
    location: Optional[str] = None
    telemetry_snapshot: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    edge_id: str
    source: str
    target: str
    relationship: str
    weight: float = 1.0
    direction: str = "directed"
    risk_factor: float = 1.0

class BlastRadiusResponse(BaseModel):
    failed_asset: str
    affected_assets: List[str]
    propagation_path: List[Dict[str, str]]
    max_distance: int
    severity: str

class GraphStatistics(BaseModel):
    total_nodes: int
    total_edges: int
    connected_components: int
    is_directed_acyclic_graph: bool
    density: float
