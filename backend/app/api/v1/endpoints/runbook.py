from fastapi import APIRouter, HTTPException, status
from app.schemas.runbook import RunbookRequest, Runbook, FeedbackRequest, RunbookStatistics
from app.services.runbook.RunbookEngine import RunbookEngine

router = APIRouter()
engine = RunbookEngine()

@router.post("/generate", response_model=Runbook, status_code=status.HTTP_201_CREATED)
def generate_runbook(request: RunbookRequest):
    try:
        return engine.generate(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{runbook_id}", response_model=Runbook)
def get_runbook(runbook_id: str):
    rb = engine.get_runbook(runbook_id)
    if not rb:
        raise HTTPException(status_code=404, detail="Runbook not found.")
    return rb

@router.put("/{runbook_id}/step/{step_id}", response_model=Runbook)
def process_step_feedback(runbook_id: str, step_id: str, request: FeedbackRequest):
    try:
        return engine.process_feedback(runbook_id, step_id, request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{runbook_id}/regenerate", response_model=Runbook)
def regenerate_runbook(runbook_id: str):
    try:
        return engine.regenerate(runbook_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/statistics/", response_model=RunbookStatistics)
def get_statistics():
    return engine.get_statistics()
