from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import RoleChecker
from app.schemas.memory import IncidentMemory, SearchMemoryRequest, StoreMemoryRequest
from app.services.memory.OperationalMemoryEngine import OperationalMemoryEngine

router = APIRouter()
engine = OperationalMemoryEngine()

mem_read_check = RoleChecker(allowed_roles=["Operator", "Engineer", "Auditor", "Admin"])
mem_write_check = RoleChecker(allowed_roles=["Engineer", "Admin"])


@router.post("/store", response_model=IncidentMemory, status_code=status.HTTP_201_CREATED)
def store_incident(request: StoreMemoryRequest, current_user: dict = Depends(mem_write_check)):
    return engine.store_incident(request)


@router.get("/incidents", response_model=List[IncidentMemory])
def get_incidents(current_user: dict = Depends(mem_read_check)):
    return engine.get_all_incidents()


@router.get("/trends")
def get_trends(current_user: dict = Depends(mem_read_check)):
    return engine.get_trends()


@router.get("/{incident_id}", response_model=IncidentMemory)
def get_incident(incident_id: str, current_user: dict = Depends(mem_read_check)):
    inc = engine.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return inc


@router.post("/search", response_model=List[Dict[str, Any]])
def search_incidents(request: SearchMemoryRequest, current_user: dict = Depends(mem_read_check)):
    return engine.search_similar(request.query, request.top_k)
