from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from typing import List, Dict
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.schemas.document import IngestedDocument, DocumentResponse
from app.services.ingestion.pipeline import IngestionPipeline
from app.database.session import get_db
from app.models.models import DocumentModel
from app.services.rag.vector_store import global_vector_store

router = APIRouter()
pipeline = IngestionPipeline()

class IndexRequest(BaseModel):
    document_id: str

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload and ingest an industrial document.
    Triggers Validation -> Parser -> OCR (if needed) -> Chunking.
    """
    if file.content_type not in ["application/pdf", "text/csv"]:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
        
    content = await file.read()
    
    # Process synchronously for demo
    ingested_doc = pipeline.process_file(file.filename, content, file.content_type)
    
    if ingested_doc.status == "failed":
        raise HTTPException(status_code=422, detail=f"Ingestion failed: {ingested_doc.error_message}")
        
    # Store in Database
    db_doc = DocumentModel(
        document_id=ingested_doc.document_id,
        filename=ingested_doc.filename,
        file_type=ingested_doc.file_type,
        status=ingested_doc.status,
        chunks=[c.model_dump() for c in ingested_doc.chunks] if ingested_doc.chunks else []
    )
    db.add(db_doc)
    db.commit()
    
    return DocumentResponse(
        document_id=ingested_doc.document_id,
        filename=ingested_doc.filename,
        status=ingested_doc.status,
        chunk_count=len(ingested_doc.chunks)
    )

@router.get("/{document_id}", response_model=IngestedDocument)
def get_document(document_id: str, db: Session = Depends(get_db)):
    """Retrieve full structured JSON of an ingested document including all chunks."""
    doc = db.query(DocumentModel).filter(DocumentModel.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Map back to schemas.document.IngestedDocument
    from app.schemas.document import DocumentChunk
    chunks_list = [DocumentChunk(**c) for c in doc.chunks] if doc.chunks else []
    return IngestedDocument(
        document_id=doc.document_id,
        filename=doc.filename,
        file_type=doc.file_type,
        status=doc.status,
        chunks=chunks_list
    )

@router.post("/index", status_code=status.HTTP_200_OK)
def index_document(request: IndexRequest, db: Session = Depends(get_db)):
    """
    Index all chunks of a previously uploaded document into the Vector Store.
    """
    doc = db.query(DocumentModel).filter(DocumentModel.document_id == request.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    try:
        from app.schemas.document import DocumentChunk
        chunks_list = [DocumentChunk(**c) for c in doc.chunks] if doc.chunks else []
        global_vector_store.index_chunks(chunks_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index: {str(e)}")
        
    return {"message": "Successfully indexed chunks", "chunk_count": len(chunks_list)}

@router.get("/", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    """List all ingested documents."""
    docs = db.query(DocumentModel).all()
    return [
        DocumentResponse(
            document_id=doc.document_id,
            filename=doc.filename,
            status=doc.status,
            chunk_count=len(doc.chunks) if doc.chunks else 0
        )
        for doc in docs
    ]

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a document from the system."""
    doc = db.query(DocumentModel).filter(DocumentModel.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()

