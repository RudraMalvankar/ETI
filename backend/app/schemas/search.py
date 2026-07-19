from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    asset_id: Optional[str] = None
    document_id: Optional[str] = None

class SearchResultChunk(BaseModel):
    chunk_id: str
    document_id: str
    page_number: Optional[int]
    asset_id: Optional[str]
    text: str
    metadata: Dict[str, Any]
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResultChunk]
    query_time_ms: int
