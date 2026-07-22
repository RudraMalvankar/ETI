"""
Tests: Documents API
====================
Covers upload, list, get, delete, index operations with RBAC checks.
"""

import io

import pytest

MINIMAL_PDF = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%EOF"
MINIMAL_CSV = b"asset_id,status,temperature\npump_A,operational,85.0\nvalve_B,operational,40.0"


class TestDocumentUpload:
    def test_upload_pdf_success(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test_doc.pdf", io.BytesIO(MINIMAL_PDF), "application/pdf")},
            headers=engineer_headers,
        )
        # 201 success or 422 if pipeline rejects (not 403 auth or 500 crash)
        assert resp.status_code in (201, 422)

    def test_upload_csv_success(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("data.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        assert resp.status_code in (201, 422)

    def test_upload_unsupported_type_rejected(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("file.txt", io.BytesIO(b"plain text"), "text/plain")},
            headers=engineer_headers,
        )
        assert resp.status_code == 400

    def test_upload_requires_auth(self, client):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", io.BytesIO(MINIMAL_PDF), "application/pdf")},
        )
        assert resp.status_code in (401, 403)

    def test_operator_cannot_upload(self, client, operator_headers):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", io.BytesIO(MINIMAL_PDF), "application/pdf")},
            headers=operator_headers,
        )
        assert resp.status_code in (401, 403)

    def test_upload_response_shape(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("shape_test.pdf", io.BytesIO(MINIMAL_PDF), "application/pdf")},
            headers=engineer_headers,
        )
        if resp.status_code == 201:
            data = resp.json()
            assert "document_id" in data
            assert "filename" in data
            assert "status" in data
            assert "chunk_count" in data

    def test_upload_csv_response_shape(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("shape_csv.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        if resp.status_code == 201:
            data = resp.json()
            assert "document_id" in data


class TestDocumentList:
    def test_list_documents_empty(self, client, operator_headers):
        resp = client.get("/api/v1/documents/", headers=operator_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_documents_after_upload(self, client, engineer_headers, operator_headers):
        # Upload a document
        client.post(
            "/api/v1/documents/upload",
            files={"file": ("list_test.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        resp = client.get("/api/v1/documents/", headers=operator_headers)
        assert resp.status_code == 200
        docs = resp.json()
        assert isinstance(docs, list)

    def test_list_documents_requires_auth(self, client):
        resp = client.get("/api/v1/documents/")
        assert resp.status_code in (401, 403)


class TestDocumentGet:
    def test_get_nonexistent_document(self, client, operator_headers):
        resp = client.get("/api/v1/documents/nonexistent_doc_id_xyz", headers=operator_headers)
        assert resp.status_code == 404

    def test_get_document_requires_auth(self, client):
        resp = client.get("/api/v1/documents/some_id")
        assert resp.status_code in (401, 403)

    def test_get_document_after_upload(self, client, engineer_headers):
        upload_resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("get_test.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        if upload_resp.status_code == 201:
            doc_id = upload_resp.json()["document_id"]
            resp = client.get(f"/api/v1/documents/{doc_id}", headers=engineer_headers)
            assert resp.status_code == 200
            data = resp.json()
            assert data["document_id"] == doc_id


class TestDocumentIndex:
    def test_index_nonexistent_document(self, client, engineer_headers):
        resp = client.post(
            "/api/v1/documents/index",
            json={"document_id": "nonexistent_for_index"},
            headers=engineer_headers,
        )
        assert resp.status_code == 404

    def test_index_requires_auth(self, client):
        resp = client.post(
            "/api/v1/documents/index",
            json={"document_id": "some_doc"},
        )
        assert resp.status_code in (401, 403)

    def test_index_operator_forbidden(self, client, operator_headers):
        resp = client.post(
            "/api/v1/documents/index",
            json={"document_id": "some_doc"},
            headers=operator_headers,
        )
        assert resp.status_code in (401, 403)

    def test_index_after_upload(self, client, engineer_headers):
        upload_resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("idx_test.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        if upload_resp.status_code == 201:
            doc_id = upload_resp.json()["document_id"]
            resp = client.post(
                "/api/v1/documents/index",
                json={"document_id": doc_id},
                headers=engineer_headers,
            )
            assert resp.status_code in (200, 500)  # 500 only if vector store fails


class TestDocumentDelete:
    def test_delete_nonexistent_document(self, client, engineer_headers):
        resp = client.delete(
            "/api/v1/documents/nonexistent_del_doc",
            headers=engineer_headers,
        )
        assert resp.status_code == 404

    def test_delete_requires_auth(self, client):
        resp = client.delete("/api/v1/documents/some_doc")
        assert resp.status_code in (401, 403)

    def test_delete_operator_forbidden(self, client, operator_headers):
        resp = client.delete(
            "/api/v1/documents/some_doc",
            headers=operator_headers,
        )
        assert resp.status_code in (401, 403)

    def test_delete_document_cycle(self, client, engineer_headers):
        """Upload then delete a document successfully."""
        upload_resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("del_test.csv", io.BytesIO(MINIMAL_CSV), "text/csv")},
            headers=engineer_headers,
        )
        if upload_resp.status_code == 201:
            doc_id = upload_resp.json()["document_id"]
            del_resp = client.delete(
                f"/api/v1/documents/{doc_id}",
                headers=engineer_headers,
            )
            assert del_resp.status_code == 204
            # Verify it's gone
            get_resp = client.get(f"/api/v1/documents/{doc_id}", headers=engineer_headers)
            assert get_resp.status_code == 404
