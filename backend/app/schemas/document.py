import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    page_number: Optional[int] = None
    asset_id: Optional[str] = None
    title: Optional[str] = None
    section: Optional[str] = None
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class IngestedDocument(BaseModel):
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_type: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    chunks: List[DocumentChunk] = Field(default_factory=list)
    status: str = "processing"
    error_message: Optional[str] = None


class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    chunk_count: int
