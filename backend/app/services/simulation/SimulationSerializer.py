from typing import Any
from app.database.session import SessionLocal
from app.models.simulation_runbook import SimulationModel

class SimulationSerializer:
    """
    Persists simulation results deterministically inside SQLAlchemy database.
    """
    def save(self, simulation_id: str, data: Any):
        db = SessionLocal()
        try:
            # data can be a SimulationResponse model or dict
            data_dict = data.model_dump() if hasattr(data, 'model_dump') else dict(data)
            req_data = data_dict.get("request", {})
            failed_asset = req_data.get("failed_asset") or data_dict.get("failed_asset", "Unknown")
            failure_type = req_data.get("failure_type") or data_dict.get("failure_type", "Unknown")

            db_sim = SimulationModel(
                simulation_id=simulation_id,
                failed_asset=failed_asset,
                failure_type=failure_type,
                scenarios=data_dict.get("scenarios", [])
            )
            db.merge(db_sim)
            db.commit()
        finally:
            db.close()

    def get(self, simulation_id: str) -> Any:
        db = SessionLocal()
        try:
            row = db.query(SimulationModel).filter(SimulationModel.simulation_id == simulation_id).first()
            if not row:
                return None
            from app.schemas.simulation import SimulationResponse, ScenarioResult, SimulationRequest
            sc_list = [ScenarioResult(**s) for s in row.scenarios] if row.scenarios else []
            sim_req = SimulationRequest(failed_asset=row.failed_asset, failure_type=row.failure_type)
            return SimulationResponse(
                simulation_id=row.simulation_id,
                request=sim_req,
                scenarios=sc_list
            )
        finally:
            db.close()
        
    def get_all(self):
        db = SessionLocal()
        try:
            rows = db.query(SimulationModel).all()
            from app.schemas.simulation import SimulationResponse, ScenarioResult, SimulationRequest
            res = []
            for row in rows:
                sc_list = [ScenarioResult(**s) for s in row.scenarios] if row.scenarios else []
                sim_req = SimulationRequest(failed_asset=row.failed_asset, failure_type=row.failure_type)
                res.append(SimulationResponse(
                    simulation_id=row.simulation_id,
                    request=sim_req,
                    scenarios=sc_list
                ))
            return res
        finally:
            db.close()

# Global persistence for tests
global_simulation_db = SimulationSerializer()

