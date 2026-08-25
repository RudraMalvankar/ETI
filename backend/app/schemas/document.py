import uuid
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    page_number: int | None = None
    asset_id: str | None = None
    title: str | None = None
    section: str | None = None
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class IngestedDocument(BaseModel):
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_type: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    chunks: list[DocumentChunk] = Field(default_factory=list)
    status: str = "processing"
    error_message: str | None = None


class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    chunk_count: int
