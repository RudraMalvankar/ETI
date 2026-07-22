"""
Strict authenticated API validation for the APEX document intelligence flow.

This script proves the following through the FastAPI surface:

1. Register a user
2. Elevate the user role in the database for document write access
3. Login and obtain a JWT
4. Upload a synthetic industrial PDF
5. Fetch the ingested document details
6. Index document chunks into a temporary live Qdrant collection
7. Execute authenticated semantic search through the API

The script fails loudly if any real step does not work.
"""

from __future__ import annotations

import io
import sys
import uuid
from pathlib import Path

import fitz
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.api.v1.endpoints import documents as documents_endpoint
from app.api.v1.endpoints import search as search_endpoint
from app.core.rate_limiter import limiter
from app.database.session import Base, SessionLocal, engine
from app.main import app
from app.models.models import DocumentModel, UserModel
from app.services.rag.vector_store import VectorStoreService


def create_validation_pdf_bytes() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    text = """APEX API Validation Manual
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
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def run_validation() -> None:
    Base.metadata.create_all(bind=engine)

    username = f"api_live_{uuid.uuid4().hex[:8]}"
    password = "ApiLiveValidation123!"
    temp_collection_name = f"apex_api_validation_{uuid.uuid4().hex[:8]}"
    temp_store = VectorStoreService(collection_name=temp_collection_name)

    original_documents_store = documents_endpoint.global_vector_store
    original_search_store = search_endpoint.global_vector_store
    documents_endpoint.global_vector_store = temp_store
    search_endpoint.global_vector_store = temp_store

    client = TestClient(app, raise_server_exceptions=True)
    uploaded_document_id: str | None = None

    try:
        register_response = client.post(
            "/api/v1/auth/register",
            json={"username": username, "password": password},
        )
        if register_response.status_code != 201:
            raise RuntimeError(
                f"Registration failed: {register_response.status_code} {register_response.text}"
            )

        db = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.username == username).first()
            if not user:
                raise RuntimeError("Registered user was not found in the database.")
            user.role = "Engineer"
            db.commit()
        finally:
            db.close()

        limiter.reset()

        login_response = client.post(
            "/api/v1/auth/login",
            json={"username": username, "password": password},
        )
        if login_response.status_code != 200:
            raise RuntimeError(
                f"Login failed: {login_response.status_code} {login_response.text}"
            )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        pdf_bytes = create_validation_pdf_bytes()
        upload_response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("api_validation_manual.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
            headers=headers,
        )
        if upload_response.status_code != 201:
            raise RuntimeError(
                f"Upload failed: {upload_response.status_code} {upload_response.text}"
            )
        upload_data = upload_response.json()
        uploaded_document_id = upload_data["document_id"]
        if upload_data["chunk_count"] < 1:
            raise RuntimeError("Upload succeeded but no chunks were reported.")

        detail_response = client.get(f"/api/v1/documents/{uploaded_document_id}", headers=headers)
        if detail_response.status_code != 200:
            raise RuntimeError(
                f"Document detail failed: {detail_response.status_code} {detail_response.text}"
            )
        detail_data = detail_response.json()
        if not detail_data.get("chunks"):
            raise RuntimeError("Document detail returned no chunks.")

        index_response = client.post(
            "/api/v1/documents/index",
            json={"document_id": uploaded_document_id},
            headers=headers,
        )
        if index_response.status_code != 200:
            raise RuntimeError(
                f"Indexing failed: {index_response.status_code} {index_response.text}"
            )

        search_response = client.post(
            "/api/v1/search/",
            json={
                "query": "What should operators do when pump P-101 overheats?",
                "top_k": 3,
                "document_id": uploaded_document_id,
            },
            headers=headers,
        )
        if search_response.status_code != 200:
            raise RuntimeError(
                f"Search failed: {search_response.status_code} {search_response.text}"
            )
        results = search_response.json()["results"]
        if not results:
            raise RuntimeError("Authenticated API search returned no results.")
        top_text = results[0]["text"]
        if "Isolate pump P-101" not in top_text:
            raise RuntimeError("Top API search result did not contain expected guidance.")

        info = temp_store.client.get_collection(temp_collection_name)
        print("LIVE_API_VALIDATION_OK")
        print(f"user={username}")
        print(f"document_id={uploaded_document_id}")
        print(f"chunk_count={len(detail_data['chunks'])}")
        print(f"collection_name={temp_collection_name}")
        print(f"points_count={getattr(info, 'points_count', None)}")
        print(f"top_result_preview={top_text[:250]}")
    finally:
        documents_endpoint.global_vector_store = original_documents_store
        search_endpoint.global_vector_store = original_search_store

        try:
            temp_store.client.delete_collection(temp_collection_name)
        except Exception:
            pass

        db = SessionLocal()
        try:
            try:
                if uploaded_document_id:
                    db.query(DocumentModel).filter(
                        DocumentModel.document_id == uploaded_document_id
                    ).delete()
                db.query(UserModel).filter(UserModel.username == username).delete()
                db.commit()
            except Exception:
                db.rollback()
        finally:
            db.close()


if __name__ == "__main__":
    run_validation()
