import datetime
from typing import List, Optional

from app.database.session import get_db_context
from app.models.models import IncidentModel
from app.schemas.memory import IncidentMemory


class IncidentHistoryStore:
    """
    Production-ready persistent database store for incident history.
    Uses SQLAlchemy models to query and persist to PostgreSQL/SQLite.
    """

    @classmethod
    def save(cls, incident: IncidentMemory):
        with get_db_context() as db:
            # Parse ISO string back to datetime
            dt = datetime.datetime.fromisoformat(incident.timestamp)
            db_incident = IncidentModel(
                incident_id=incident.incident_id,
                failed_asset=incident.failed_asset,
                failure_type=incident.failure_type,
                graph_snapshot=incident.graph_snapshot,
                simulation_data=incident.simulation_data,
                decision_data=incident.decision_data,
                runbook_history=incident.runbook_history,
                technician_feedback=incident.technician_feedback,
                regenerated_runbooks=incident.regenerated_runbooks,
                outcome=incident.outcome,
                timestamp=dt,
            )
            db.merge(db_incident)

    @classmethod
    def get(cls, incident_id: str) -> Optional[IncidentMemory]:
        with get_db_context() as db:
            row = db.query(IncidentModel).filter(IncidentModel.incident_id == incident_id).first()
            if not row:
                return None
            return IncidentMemory(
                incident_id=row.incident_id,
                failed_asset=row.failed_asset,
                failure_type=row.failure_type,
                graph_snapshot=row.graph_snapshot or {},
                simulation_data=row.simulation_data or {},
                decision_data=row.decision_data or {},
                runbook_history=row.runbook_history or [],
                technician_feedback=row.technician_feedback or [],
                regenerated_runbooks=row.regenerated_runbooks or [],
                outcome=row.outcome,
                timestamp=row.timestamp.isoformat(),
            )

    @classmethod
    def get_all(cls) -> List[IncidentMemory]:
        with get_db_context() as db:
            rows = db.query(IncidentModel).order_by(IncidentModel.timestamp.desc()).all()
            return [
                IncidentMemory(
                    incident_id=row.incident_id,
                    failed_asset=row.failed_asset,
                    failure_type=row.failure_type,
                    graph_snapshot=row.graph_snapshot or {},
                    simulation_data=row.simulation_data or {},
                    decision_data=row.decision_data or {},
                    runbook_history=row.runbook_history or [],
                    technician_feedback=row.technician_feedback or [],
                    regenerated_runbooks=row.regenerated_runbooks or [],
                    outcome=row.outcome,
                    timestamp=row.timestamp.isoformat(),
                )
                for row in rows
            ]


global_incident_store = IncidentHistoryStore()
