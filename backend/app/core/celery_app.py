import os

from celery import Celery

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("apex_tasks", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="app.core.celery_app.process_document_async")
def process_document_async(document_id: str):
    """
    Background job execution task to process parsed document chunks and automatically index.
    """
    from app.database.session import get_db_context
    from app.models.models import DocumentModel
    from app.schemas.document import DocumentChunk
    from app.services.rag.vector_store import global_vector_store

    try:
        with get_db_context() as db:
            doc = db.query(DocumentModel).filter(DocumentModel.document_id == document_id).first()
            if not doc:
                return f"Error: Document {document_id} not found"

            chunks_list = [DocumentChunk(**c) for c in doc.chunks] if doc.chunks else []
            if chunks_list:
                global_vector_store.index_chunks(chunks_list)
                doc.status = "completed"
            else:
                doc.status = "failed"
                doc.error_message = "No chunks found in parsed document"

            return f"Successfully processed and indexed document {document_id}"
    except Exception as e:
        with get_db_context() as db:
            doc = db.query(DocumentModel).filter(DocumentModel.document_id == document_id).first()
            if doc:
                doc.status = "failed"
                doc.error_message = str(e)
        return f"Failed: {str(e)}"
