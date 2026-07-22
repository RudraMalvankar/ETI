from typing import List

import fitz  # PyMuPDF

from app.core.config import settings
from app.schemas.document import DocumentChunk
from app.services.ingestion.ocr.base import OCRProvider
from app.services.ingestion.ocr.factory import get_ocr_provider


class PDFParser:
    def __init__(self, ocr_provider: OCRProvider = None):
        if ocr_provider is not None:
            self.ocr_provider = ocr_provider
        else:
            self.ocr_provider = get_ocr_provider()

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
                if not settings.ENABLE_OCR:
                    raise ValueError("OCR is disabled; scanned PDFs cannot be ingested.")
                if self.ocr_provider is None:
                    raise ValueError(
                        "No OCR provider is configured for scanned PDF ingestion. "
                        "Enable mock OCR explicitly for demo mode or wire a real OCR provider."
                    )
                pix = page.get_pixmap()
                img_bytes = pix.tobytes("png")
                text = self.ocr_provider.extract_text(img_bytes)
                tables = self.ocr_provider.extract_tables(img_bytes)
                metadata = {
                    "source": "ocr",
                    "provider": self.ocr_provider.__class__.__name__,
                    **self.ocr_provider.get_last_result_metadata(),
                }
            else:
                # Direct PyMuPDF text extraction (Layout Analysis happens inherently via PyMuPDF dict)
                text = page.get_text("text")
                metadata = {"source": "pdf_text"}
                tables = []

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
