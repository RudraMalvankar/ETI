from app.schemas.memory import IncidentMemory
from app.services.memory.IncidentHistoryStore import global_incident_store


class MemoryRetriever:
    """
    Retrieves memories and related incidents.
    """

    def retrieve(self, incident_id: str) -> IncidentMemory | None:
        return global_incident_store.get(incident_id)

    def retrieve_all(self) -> list[IncidentMemory]:
        return global_incident_store.get_all()
