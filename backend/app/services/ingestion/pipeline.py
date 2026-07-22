from app.schemas.document import IngestedDocument
from app.services.ingestion.chunker import Chunker
from app.services.ingestion.parsers.pdf import PDFParser


class IngestionPipeline:
    """
    Master orchestrator for the document ingestion process.
    Flow: Upload -> Validation -> Parser -> Metadata -> Chunking -> Output
    """

    def __init__(self):
        self.pdf_parser = PDFParser()
        self.chunker = Chunker()

    def process_file(self, filename: str, file_bytes: bytes, file_type: str) -> IngestedDocument:
        doc = IngestedDocument(filename=filename, file_type=file_type)

        try:
            # 1. Validation
            if not file_bytes:
                raise ValueError("Empty file payload.")

            # 2. Parser Selection
            if file_type == "application/pdf":
                page_chunks = self.pdf_parser.parse(file_bytes, doc.document_id)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")

            if not page_chunks:
                raise ValueError("Document contains no parseable content.")

            # 3. Chunking
            final_chunks = self.chunker.chunk_document(page_chunks)

            # 4. Finalize
            doc.chunks = final_chunks
            doc.status = "completed"

        except Exception as e:
            doc.status = "failed"
            doc.error_message = str(e)

        return doc
