from fastapi import APIRouter

from app.api.v1.endpoints import (
    audit,
    auth,
    compliance,
    decision,
    documents,
    explainability,
    graph,
    memory,
    runbook,
    search,
    settings,
    simulation,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(decision.router, prefix="/decision", tags=["decision"])
api_router.include_router(runbook.router, prefix="/runbook", tags=["runbook"])
api_router.include_router(memory.router, prefix="/memory", tags=["memory"])
api_router.include_router(explainability.router, prefix="/explainability", tags=["explainability"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
