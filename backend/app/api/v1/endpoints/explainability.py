from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.explainability import ExplanationResponse
from app.services.explainability.ExplanationEngine import ExplanationEngine
from app.core.auth import RoleChecker
from typing import Dict, Any

router = APIRouter()
engine = ExplanationEngine()

explain_check = RoleChecker(allowed_roles=["Operator", "Engineer", "Auditor", "Admin"])

@router.post("/explain", response_model=ExplanationResponse)
def explain_decision(context: Dict[str, Any], current_user: dict = Depends(explain_check)):
    return engine.generate_explanation(context)
