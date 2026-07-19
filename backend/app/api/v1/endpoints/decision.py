from fastapi import APIRouter, HTTPException, status
from app.schemas.decision import DecisionRequest, DecisionResponse
from app.services.decision.DecisionEngine import DecisionEngine

router = APIRouter()

@router.post("/recommend", response_model=DecisionResponse, status_code=status.HTTP_200_OK)
def recommend_decision(request: DecisionRequest):
    engine = DecisionEngine()
    try:
        return engine.make_decision(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
