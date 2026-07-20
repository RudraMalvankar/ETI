from fastapi import APIRouter, HTTPException, status
from app.schemas.memory import IncidentMemory, StoreMemoryRequest, SearchMemoryRequest
from app.services.memory.OperationalMemoryEngine import OperationalMemoryEngine
from typing import List, Dict, Any

router = APIRouter()
engine = OperationalMemoryEngine()

@router.post("/store", response_model=IncidentMemory, status_code=status.HTTP_201_CREATED)
def store_incident(request: StoreMemoryRequest):
    return engine.store_incident(request)

@router.get("/incidents", response_model=List[IncidentMemory])
def get_incidents():
    return engine.get_all_incidents()

@router.get("/trends")
def get_trends():
    return engine.get_trends()

@router.get("/{incident_id}", response_model=IncidentMemory)
def get_incident(incident_id: str):
    inc = engine.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return inc

@router.post("/search", response_model=List[Dict[str, Any]])
def search_incidents(request: SearchMemoryRequest):
    return engine.search_similar(request.query, request.top_k)
