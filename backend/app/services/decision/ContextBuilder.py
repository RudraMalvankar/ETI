from typing import Any, Dict, List

from app.services.graph.GraphFactory import GraphFactory
from app.services.simulation.SimulationSerializer import global_simulation_db


class ContextBuilder:
    """
    Assembles context from Graph, Simulation, and Retrieved Documents.
    """

    def build_context(
        self, failed_asset: str, simulation_id: str, retrieved_chunks: List[Any]
    ) -> Dict[str, Any]:
        # Get graph data
        graph = GraphFactory.get_graph()
        asset_info = graph.get_node(failed_asset) if graph.has_node(failed_asset) else {}

        # Get simulation data
        sim = global_simulation_db.get(simulation_id)
        if not sim:
            raise ValueError(f"Simulation {simulation_id} not found.")

        # Serialize chunks
        chunks_data = []
        for chunk in retrieved_chunks:
            chunks_data.append(
                {
                    "chunk_id": chunk.chunk_id,
                    "document_id": chunk.document_id,
                    "text": chunk.text,
                    "score": chunk.score,
                }
            )

        return {
            "failed_asset": failed_asset,
            "asset_metadata": asset_info,
            "scenarios": [s.model_dump() for s in sim.scenarios],
            "documents": chunks_data,
        }
