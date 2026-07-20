from fastapi import APIRouter, HTTPException, status
from app.schemas.explainability import ExplanationResponse
from app.services.explainability.ExplanationEngine import ExplanationEngine
from typing import Dict, Any

router = APIRouter()
engine = ExplanationEngine()

@router.post("/explain", response_model=ExplanationResponse)
def explain_decision(context: Dict[str, Any]):
    return engine.generate_explanation(context)
