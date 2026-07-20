import datetime
from app.schemas.memory import IncidentMemory
from app.services.graph.GraphFactory import GraphFactory
from app.services.simulation.SimulationSerializer import global_simulation_db
from app.services.runbook.RunbookEngine import RunbookEngine
import uuid

class MemorySerializer:
    """
    Gathers all pieces of an incident and serializes them into an IncidentMemory object.
    """
    def serialize(self, failed_asset: str, failure_type: str, sim_id: str, runbook_id: str) -> IncidentMemory:
        # Get graph snapshot
        graph = GraphFactory.get_graph()
        graph_snapshot = {
            "nodes_count": len(graph.all_nodes()),
            "edges_count": len(graph.all_edges()),
            "failed_node": graph.get_node(failed_asset) if graph.has_node(failed_asset) else {}
        }
        
        # Get Simulation Data
        sim = global_simulation_db.get(sim_id)
        sim_data = sim.model_dump() if sim else {}
        
        # Get Runbook Data
        rb_engine = RunbookEngine()
        rb = rb_engine.get_runbook(runbook_id)
        rb_data = rb.model_dump() if rb else {}
        
        # Dummy Decision Data (in a real system, we'd retrieve this from a DecisionStore)
        dec_data = {"note": "Stored in Runbook / Context"}
        
        return IncidentMemory(
            incident_id=str(uuid.uuid4()),
            failed_asset=failed_asset,
            failure_type=failure_type,
            graph_snapshot=graph_snapshot,
            simulation_data=sim_data,
            decision_data=dec_data,
            runbook_history=rb_data.get('steps', []),
            technician_feedback=rb_data.get('update_history', []),
            timestamp=datetime.datetime.utcnow().isoformat()
        )
