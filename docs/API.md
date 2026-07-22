# APEX REST API Reference (v1.0.0)

## Overview
APEX exposes versioned REST APIs under `/api/v1/`. OpenAPI JSON schema is available at `/openapi.json` and interactive Swagger UI at `/docs`.

---

## Authentication Endpoints

### `POST /api/v1/auth/register`
- **Description**: Register a new user account.
- **Request Body**:
  ```json
  {
    "username": "engineer_01",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `201 Created`

### `POST /api/v1/auth/login`
- **Description**: Authenticate user credentials and issue JWT access token.
- **Request Body**:
  ```json
  {
    "username": "engineer_01",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 86400
  }
  ```

---

## Document Intelligence Endpoints

### `POST /api/v1/documents/upload`
- **Role Required**: `Engineer` or `Admin`
- **Form Data**: `file` (PDF/CSV)
- **Response**: `201 Created`

### `POST /api/v1/documents/index`
- **Role Required**: `Engineer` or `Admin`
- **Request Body**: `{"document_id": "doc_123"}`
- **Response**: `200 OK`

---

## RAG Search & Vector Retrieval

### `POST /api/v1/search/`
- **Role Required**: `Operator`+
- **Request Body**:
  ```json
  {
    "query": "P-101 bearing temperature threshold emergency procedure",
    "top_k": 3
  }
  ```
- **Response**: `200 OK`

---

## Knowledge Graph Endpoints

### `POST /api/v1/graph/build`
- **Role Required**: `Admin`
- **Request Body**: Graph topology payload (nodes & edges)
- **Response**: `201 Created`

### `POST /api/v1/graph/blast-radius`
- **Role Required**: `Operator`+
- **Request Body**: `{"failed_asset": "P-101"}`
- **Response**: `200 OK`

---

## Decision & Runbook Endpoints

### `POST /api/v1/decision/recommend`
- **Role Required**: `Operator`+
- **Request Body**: `{"failed_asset": "P-101", "failure_type": "bearing_overheat", "simulation_id": "sim_123"}`
- **Response**: `200 OK`

### `POST /api/v1/runbook/generate`
- **Role Required**: `Operator`+
- **Response**: `201 Created`

---

## Compliance & Audit Endpoints

### `POST /api/v1/compliance/report`
- **Role Required**: `Auditor` or `Admin`
- **Response**: `201 Created`

### `POST /api/v1/compliance/export/pdf`
- **Role Required**: `Auditor` or `Admin`
- **Response**: `200 OK` (Application/PDF binary stream)

### `GET /api/v1/audit/`
- **Role Required**: `Auditor` or `Admin`
- **Response**: `200 OK`
