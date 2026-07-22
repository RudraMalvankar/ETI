from typing import List, Optional

from app.schemas.memory import IncidentMemory
from app.services.memory.IncidentHistoryStore import global_incident_store


class MemoryRetriever:
    """
    Retrieves memories and related incidents.
    """

    def retrieve(self, incident_id: str) -> Optional[IncidentMemory]:
        return global_incident_store.get(incident_id)

    def retrieve_all(self) -> List[IncidentMemory]:
        return global_incident_store.get_all()
