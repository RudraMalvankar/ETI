from app.schemas.memory import IncidentMemory, StoreMemoryRequest
from app.services.memory.IncidentHistoryStore import global_incident_store
from app.services.memory.MemorySerializer import MemorySerializer
from app.services.memory.PatternMatcher import PatternMatcher
from app.services.memory.MemoryRetriever import MemoryRetriever
from app.services.memory.TrendAnalyzer import TrendAnalyzer
from typing import Dict, Any, List

class OperationalMemoryEngine:
    """
    Main orchestrator for Operational Memory Engine.
    """
    def __init__(self):
        self.serializer = MemorySerializer()
        self.matcher = PatternMatcher()
        self.retriever = MemoryRetriever()
        self.analyzer = TrendAnalyzer()

    def store_incident(self, request: StoreMemoryRequest) -> IncidentMemory:
        incident = self.serializer.serialize(request)
        global_incident_store.save(incident)
        return incident

    def get_incident(self, incident_id: str) -> IncidentMemory:
        return self.retriever.retrieve(incident_id)

    def get_all_incidents(self) -> List[IncidentMemory]:
        return self.retriever.retrieve_all()

    def search_similar(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        return self.matcher.search_similar(query, top_k)

    def get_trends(self) -> Dict[str, Any]:
        return self.analyzer.analyze_trends()
