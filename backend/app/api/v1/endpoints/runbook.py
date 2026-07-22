from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.runbook import RunbookRequest, Runbook, FeedbackRequest, RunbookStatistics
from app.services.runbook.RunbookEngine import RunbookEngine
from app.core.auth import RoleChecker

router = APIRouter()
engine = RunbookEngine()

rb_read_check = RoleChecker(allowed_roles=["Operator", "Engineer", "Auditor", "Admin"])
rb_write_check = RoleChecker(allowed_roles=["Operator", "Engineer", "Admin"])

@router.post("/generate", response_model=Runbook, status_code=status.HTTP_201_CREATED)
def generate_runbook(request: RunbookRequest, current_user: dict = Depends(rb_write_check)):
    try:
        return engine.generate(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{runbook_id}", response_model=Runbook)
def get_runbook(runbook_id: str, current_user: dict = Depends(rb_read_check)):
    rb = engine.get_runbook(runbook_id)
    if not rb:
        raise HTTPException(status_code=404, detail="Runbook not found.")
    return rb

@router.put("/{runbook_id}/step/{step_id}", response_model=Runbook)
def process_step_feedback(runbook_id: str, step_id: str, request: FeedbackRequest, current_user: dict = Depends(rb_write_check)):
    try:
        return engine.process_feedback(runbook_id, step_id, request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{runbook_id}/regenerate", response_model=Runbook)
def regenerate_runbook(runbook_id: str, current_user: dict = Depends(rb_write_check)):
    try:
        return engine.regenerate(runbook_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/statistics/", response_model=RunbookStatistics)
def get_statistics(current_user: dict = Depends(rb_read_check)):
    return engine.get_statistics()
