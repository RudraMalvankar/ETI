from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List, Dict
from app.schemas.document import IngestedDocument, DocumentResponse
from app.services.ingestion.pipeline import IngestionPipeline
from app.database.mock_store import DOCUMENTS_DB

router = APIRouter()
pipeline = IngestionPipeline()

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and ingest an industrial document.
    Triggers Validation -> Parser -> OCR (if needed) -> Chunking.
    """
    if file.content_type not in ["application/pdf", "text/csv"]:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
        
    content = await file.read()
    
    # Process synchronously for demo; in production this is celery/async
    ingested_doc = pipeline.process_file(file.filename, content, file.content_type)
    
    if ingested_doc.status == "failed":
        raise HTTPException(status_code=422, detail=f"Ingestion failed: {ingested_doc.error_message}")
        
    # Store in mock DB
    DOCUMENTS_DB[ingested_doc.document_id] = ingested_doc
    
    return DocumentResponse(
        document_id=ingested_doc.document_id,
        filename=ingested_doc.filename,
        status=ingested_doc.status,
        chunk_count=len(ingested_doc.chunks)
    )

@router.get("/{document_id}", response_model=IngestedDocument)
def get_document(document_id: str):
    """Retrieve full structured JSON of an ingested document including all chunks."""
    doc = DOCUMENTS_DB.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/", response_model=List[DocumentResponse])
def list_documents():
    """List all ingested documents."""
    return [
        DocumentResponse(
            document_id=doc.document_id,
            filename=doc.filename,
            status=doc.status,
            chunk_count=len(doc.chunks)
        )
        for doc in DOCUMENTS_DB.values()
    ]

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str):
    """Delete a document from the system."""
    if document_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")
    del DOCUMENTS_DB[document_id]
