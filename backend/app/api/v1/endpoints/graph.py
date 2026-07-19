from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any
from app.schemas.graph import GraphNode, GraphEdge, BlastRadiusResponse, GraphStatistics
from app.services.graph.GraphBuilder import GraphBuilder
from app.services.graph.GraphTraversal import GraphTraversal
from app.services.graph.BlastRadiusEngine import BlastRadiusEngine
from app.services.graph.PathFinder import PathFinder
from app.services.graph.GraphSerializer import GraphSerializer
from app.services.graph.GraphFactory import GraphFactory
import networkx as nx

router = APIRouter()

class GraphBuildRequest(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class BlastRadiusRequest(BaseModel):
    failed_asset: str

@router.post("/build", status_code=status.HTTP_201_CREATED)
def build_graph(request: GraphBuildRequest):
    builder = GraphBuilder()
    GraphFactory.reset()
    builder.build_from_lists(request.nodes, request.edges)
    return {"message": "Graph built successfully", "nodes": len(request.nodes), "edges": len(request.edges)}

@router.get("/", response_model=Dict[str, Any])
def get_graph_data():
    serializer = GraphSerializer()
    return serializer.serialize()

@router.get("/node/{node_id}")
def get_node(node_id: str):
    graph = GraphFactory.get_graph()
    if not graph.has_node(node_id):
        raise HTTPException(status_code=404, detail="Node not found")
    return graph.get_node(node_id)

@router.get("/neighbors/{node_id}")
def get_neighbors(node_id: str):
    traversal = GraphTraversal()
    return {"neighbors": traversal.get_neighbors(node_id)}

@router.post("/blast-radius", response_model=BlastRadiusResponse)
def blast_radius(request: BlastRadiusRequest):
    engine = BlastRadiusEngine()
    try:
        return engine.compute_blast_radius(request.failed_asset)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/path")
def get_path(source: str, target: str):
    finder = PathFinder()
    path = finder.shortest_path(source, target)
    if not path:
        raise HTTPException(status_code=404, detail="No path found")
    return {"path": path}

@router.get("/statistics", response_model=GraphStatistics)
def get_statistics():
    graph = GraphFactory.get_graph().internal_graph
    return GraphStatistics(
        total_nodes=graph.number_of_nodes(),
        total_edges=graph.number_of_edges(),
        connected_components=nx.number_connected_components(graph.to_undirected()) if graph.number_of_nodes() > 0 else 0,
        is_directed_acyclic_graph=nx.is_directed_acyclic_graph(graph),
        density=nx.density(graph)
    )
