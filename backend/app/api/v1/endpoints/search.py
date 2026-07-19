from fastapi import APIRouter, HTTPException, status
from app.schemas.search import SearchRequest, SearchResponse
from app.services.rag.vector_store import global_vector_store
import time

router = APIRouter()

@router.post("/", response_model=SearchResponse)
def semantic_search(request: SearchRequest):
    """
    Perform hybrid semantic search.
    Returns the top-K chunks with similarity scores.
    """
    start = time.time()
    try:
        results = global_vector_store.search(
            query=request.query,
            top_k=request.top_k,
            asset_id=request.asset_id,
            document_id=request.document_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
        
    duration = int((time.time() - start) * 1000)
    return SearchResponse(results=results, query_time_ms=duration)
