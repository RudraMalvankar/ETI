from typing import Dict, List, Any
from app.schemas.memory import IncidentMemory

class IncidentHistoryStore:
    """
    In-memory data store for incident history to simulate persistence.
    Class variable _store ensures all instances share the same memory.
    """
    _store: Dict[str, IncidentMemory] = {}

    @classmethod
    def save(cls, incident: IncidentMemory):
        cls._store[incident.incident_id] = incident

    @classmethod
    def get(cls, incident_id: str) -> IncidentMemory:
        return cls._store.get(incident_id)

    @classmethod
    def get_all(cls) -> List[IncidentMemory]:
        return list(cls._store.values())

global_incident_store = IncidentHistoryStore()
