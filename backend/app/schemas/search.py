from typing import Any

from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    asset_id: str | None = None
    document_id: str | None = None


class SearchResultChunk(BaseModel):
    chunk_id: str
    document_id: str
    page_number: int | None
    asset_id: str | None
    text: str
    metadata: dict[str, Any]
    score: float


class SearchResponse(BaseModel):
    results: list[SearchResultChunk]
    query_time_ms: int
