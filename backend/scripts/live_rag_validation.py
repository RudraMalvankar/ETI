"""
Strict live validation for the APEX document intelligence backbone.

This script proves the following path using live configured services:

1. Generate a synthetic non-sensitive industrial PDF
2. Ingest it through the backend ingestion pipeline
3. Generate real embeddings with the configured embedding provider
4. Index those embeddings into a temporary Qdrant cloud collection
5. Execute semantic search against that collection
6. Fail loudly if any step breaks or returns weak evidence
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.ingestion.pipeline import IngestionPipeline
from app.services.rag.vector_store import VectorStoreService


def create_validation_pdf(pdf_path: Path) -> None:
    doc = fitz.open()
    page = doc.new_page()
    text = """APEX Validation Manual
Asset: P-101 Feed Pump
Procedure: Bearing Overheat Response

1. Isolate pump P-101 if casing temperature exceeds 95 C.
2. Switch flow to standby pump P-102.
3. Inspect lubrication line and confirm oil pressure is above 3.5 bar.
4. Verify vibration trend and review OEM maintenance limits.
5. Record findings in the incident log before restart.

Inspection Note:
During the July 2026 inspection, technicians observed elevated bearing temperature and vibration on pump P-101.
Recommended action is controlled isolation and lubrication-path inspection.
"""
    page.insert_text((72, 72), text, fontsize=12)
    doc.save(pdf_path)
    doc.close()


def run_validation() -> None:
    workspace_root = Path(__file__).resolve().parents[2]
    pdf_path = workspace_root / "tmp_apex_validation_manual.pdf"
    create_validation_pdf(pdf_path)

    pipeline = IngestionPipeline()
    doc = pipeline.process_file(pdf_path.name, pdf_path.read_bytes(), "application/pdf")

    if doc.status != "completed":
        raise RuntimeError(f"Ingestion failed: {doc.error_message}")
    if not doc.chunks:
        raise RuntimeError("Ingestion completed but no chunks were produced.")

    collection_name = f"apex_validation_{uuid.uuid4().hex[:8]}"
    store = VectorStoreService(collection_name=collection_name)

    try:
        store.index_chunks(doc.chunks)
        info = store.client.get_collection(collection_name)
        points_count = getattr(info, "points_count", 0) or 0
        if points_count != len(doc.chunks):
            raise RuntimeError(
                f"Indexed point count mismatch: expected {len(doc.chunks)}, got {points_count}"
            )

        results = store.search("What should operators do when pump P-101 overheats?", top_k=3)
        if not results:
            raise RuntimeError("Semantic search returned no results.")

        top = results[0]
        if "Isolate pump P-101" not in top.text:
            raise RuntimeError(
                "Top semantic result did not contain the expected maintenance guidance."
            )

        print("LIVE_RAG_VALIDATION_OK")
        print(f"document_id={doc.document_id}")
        print(f"chunk_count={len(doc.chunks)}")
        print(f"collection_name={collection_name}")
        print(f"points_count={points_count}")
        print(f"top_score={top.score}")
        print(f"top_result_preview={top.text[:250]}")
    finally:
        try:
            store.client.delete_collection(collection_name)
        finally:
            if pdf_path.exists():
                pdf_path.unlink()


if __name__ == "__main__":
    run_validation()
