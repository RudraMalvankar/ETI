from fastapi import APIRouter, HTTPException, status, Request
from app.schemas.decision import DecisionRequest, DecisionResponse
from app.services.decision.DecisionEngine import DecisionEngine
from app.core.rate_limiter import limiter

router = APIRouter()

@router.post("/recommend", response_model=DecisionResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
def recommend_decision(request: Request, request_body: DecisionRequest):
    engine = DecisionEngine()
    try:
        return engine.make_decision(request_body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

