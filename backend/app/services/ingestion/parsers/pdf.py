from typing import List

import fitz  # PyMuPDF

from app.schemas.document import DocumentChunk
from app.services.ingestion.ocr.base import OCRProvider
from app.services.ingestion.ocr.mock import MockOCRProvider


class PDFParser:
    def __init__(self, ocr_provider: OCRProvider = None):
        # Default to mock OCR if none provided
        self.ocr_provider = ocr_provider or MockOCRProvider()

    def is_scanned(self, page: fitz.Page) -> bool:
        """
        Heuristic: If the page has very little text but contains images, it's likely scanned.
        """
        text = page.get_text("text").strip()
        images = page.get_images(full=True)
        return len(text) < 50 and len(images) > 0

    def parse(self, file_bytes: bytes, document_id: str) -> List[DocumentChunk]:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        chunks = []

        for page_num in range(len(doc)):
            page = doc[page_num]

            # 1. Validation & Parser Selection (Searchable vs Scanned)
            if self.is_scanned(page):
                # Need OCR
                pix = page.get_pixmap()
                img_bytes = pix.tobytes("png")
                text = self.ocr_provider.extract_text(img_bytes)
                metadata = {
                    "source": "ocr",
                    "provider": self.ocr_provider.__class__.__name__,
                }
            else:
                # Direct PyMuPDF text extraction (Layout Analysis happens inherently via PyMuPDF dict)
                text = page.get_text("text")
                metadata = {"source": "pdf_text"}

            # 2. Table Extraction (Mocked logic for demo)
            tables = []
            if "table" in text.lower():
                tables = [{"mock_table_detected": True}]

            # 3. Metadata Extraction (Asset ID extraction heuristic)
            asset_id = None
            if "V-" in text or "P-" in text:
                # Naive regex simulation
                import re

                match = re.search(r"([A-Z]-\d{3})", text)
                if match:
                    asset_id = match.group(1)

            if text.strip():
                chunks.append(
                    DocumentChunk(
                        document_id=document_id,
                        page_number=page_num + 1,
                        asset_id=asset_id,
                        text=text.strip(),
                        metadata={**metadata, "tables": tables},
                    )
                )

        return chunks
