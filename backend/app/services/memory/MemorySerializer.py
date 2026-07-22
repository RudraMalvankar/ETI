import datetime
import uuid
from typing import Any, Dict

from app.schemas.memory import IncidentMemory, StoreMemoryRequest
from app.services.graph.GraphFactory import GraphFactory
from app.services.runbook.RunbookEngine import RunbookEngine
from app.services.simulation.SimulationSerializer import global_simulation_db


class MemorySerializer:
    """
    Gathers all pieces of an incident and serializes them into an IncidentMemory object.
    """

    def serialize(self, request: StoreMemoryRequest) -> IncidentMemory:
        failed_asset = request.failed_asset
        failure_type = request.failure_type
        sim_id = request.simulation_id
        runbook_id = request.runbook_id

        # 1. Graph Snapshot
        graph = GraphFactory.get_graph()
        graph_snapshot = {
            "nodes_count": len(graph.all_nodes()),
            "edges_count": len(graph.all_edges()),
            "failed_node": (graph.get_node(failed_asset) if graph.has_node(failed_asset) else {}),
        }

        # 2. Simulation Data
        sim_data: Dict[str, Any] = {}
        if sim_id:
            sim = global_simulation_db.get(sim_id)
            if sim:
                sim_data = sim.model_dump() if hasattr(sim, "model_dump") else dict(sim)

        # 3. Runbook Data & Technician Feedback
        runbook_history = []
        technician_feedback = request.technician_feedback or []
        regenerated_runbooks = []

        if runbook_id:
            rb_engine = RunbookEngine()
            rb = rb_engine.get_runbook(runbook_id)
            if rb:
                rb_dict = rb.model_dump() if hasattr(rb, "model_dump") else dict(rb)
                runbook_history = rb_dict.get("steps", [])
                if not technician_feedback and rb_dict.get("update_history"):
                    technician_feedback = rb_dict.get("update_history")
                if rb_dict.get("is_regenerated"):
                    regenerated_runbooks.append(rb_dict)

        # 4. Decision Data
        dec_data = request.decision_data or {
            "note": "Decision trace derived from Shadow Simulation & Graph analysis.",
            "recommended_strategy": f"Isolate and repair {failed_asset}",
        }

        return IncidentMemory(
            incident_id=str(uuid.uuid4()),
            failed_asset=failed_asset,
            failure_type=failure_type,
            graph_snapshot=graph_snapshot,
            simulation_data=sim_data,
            decision_data=dec_data,
            runbook_history=runbook_history,
            technician_feedback=technician_feedback,
            regenerated_runbooks=regenerated_runbooks,
            outcome=request.outcome or "Resolved",
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )
