# APEX Engineering Architecture & Foundation Blueprint

This document defines the enterprise-grade foundation for the APEX platform. It dictates the repository structure, frontend/backend architecture, API contracts, database schemas, and the development roadmap. 

---

## 1. Complete Repository Structure (Monorepo)

The repository uses a monorepo structure to keep the frontend, backend, and shared configurations tightly coupled during the rapid hackathon iteration cycle, while remaining cleanly separated for future microservice deployment.

```text
apex/
├── frontend/         # React + Vite application (User Interface)
├── backend/          # FastAPI application (Core Logic & AI)
├── shared/           # Shared TS/Pydantic schemas and types
├── docs/             # Product and Engineering Documentation
├── docker/           # Dockerfiles and compose configurations
├── scripts/          # Utility scripts (DB seed, synthetic event generators)
├── .github/          # CI/CD workflows and PR templates
├── config/           # Global configuration (e.g., eslint, prettier, tsconfig)
├── assets/           # Static assets (logos, global icons)
├── tests/            # E2E integration tests spanning frontend and backend
└── docker-compose.yml
```

---

## 2. Frontend Architecture (React + Vite)

The frontend uses a **Feature-Based Architecture**. Instead of grouping files by type (all components together, all hooks together), files are grouped by the business feature they belong to, ensuring high modularity.

```text
frontend/src/
├── app/              # App entry, global routing, global layout wrappers
├── assets/           # Images, SVGs, and fonts
├── components/       # Global reusable UI (Buttons, Modals, Inputs, Cards)
├── features/         # Feature modules (The core logic)
│   ├── graph/        # React Flow graph, node components, graph hooks
│   ├── runbook/      # Runbook panel, checklist items, dynamic routing logic
│   ├── dashboard/    # Incident feeds, telemetry widgets
│   └── compliance/   # Audit trails, PDF generator
├── hooks/            # Global custom hooks (e.g., useAuth, useWebSocket)
├── pages/            # Top-level route components (compose features here)
├── services/         # API client layer (Axios instances, REST wrappers)
├── store/            # Global state management (Zustand slices)
├── styles/           # Global Tailwind CSS and theme variables
├── types/            # TypeScript interfaces (imported from shared/)
└── utils/            # Helper functions (date formatting, math)
```

---

## 3. Backend Architecture (FastAPI)

The backend follows a **Domain-Driven Design (DDD)** approach. Business logic is separated from the API routing layer.

```text
backend/app/
├── api/              # FastAPI routers, endpoints, and dependency injection
│   ├── v1/           # API Version 1
├── core/             # App configuration, security, CORS, global exception handlers
├── services/         # Business logic layer (The "Brain")
│   ├── ai/           # LLM orchestration, PromptBuilder, JSON parsing
│   ├── graph/        # NetworkX operations, traversal logic
│   ├── simulation/   # Shadow Simulation logic and state forking
│   ├── runbook/      # Runbook generation and validation rules
│   ├── rag/          # Embeddings, retrieval, document chunking
│   └── compliance/   # Standards mapping, evidence generation
├── models/           # SQLAlchemy ORM models (Future PostgreSQL)
├── schemas/          # Pydantic models for request/response validation
├── database/         # Qdrant client, DB sessions, migrations
├── utils/            # Helper functions (logging, telemetry mocks)
└── tests/            # Pytest suite (unit and integration)
```

---

## 4. Shared Types (Schemas)

To maintain absolute type safety across the stack, the following domain models act as the contract between Python (Pydantic) and TypeScript (Interfaces).

* **`IncidentPayload`**: `{ incident_id, asset_id, timestamp, severity, sensor_data }`
* **`GraphNode`**: `{ node_id, type, label, status, telemetry_snapshot }`
* **`ShadowSimulationResult`**: `{ simulation_id, blast_radius_nodes, mitigation_paths[] }`
* **`MitigationPath`**: `{ path_id, safety_score, financial_impact, description }`
* **`RunbookSchema`**: `{ runbook_id, incident_id, steps: RunbookStep[], status }`
* **`RunbookStep`**: `{ step_id, action, target_asset, requires_loto, citation, status }`

---

## 5. Environment Configuration

### `.env.example`
```env
# --- BACKEND ---
ENVIRONMENT=development
API_V1_STR=/api/v1
OPENAI_API_KEY=sk-xxxx
QDRANT_HOST=localhost
QDRANT_PORT=6333
CORS_ORIGINS=http://localhost:3000

# --- FRONTEND ---
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

---

## 6. Docker & Infrastructure

**`docker-compose.yml` Structure:**
* **`apex-frontend`**: Node/Vite container serving the React app (Port 3000).
* **`apex-backend`**: Uvicorn/FastAPI container (Port 8000).
* **`apex-qdrant`**: Official Qdrant image (Port 6333).
* **Networking**: Internal bridge network `apex-net`.
* **Volumes**: 
  * `qdrant-data`: Persist vector embeddings.
  * `backend-cache`: Persist NetworkX serialized JSON state.

---

## 7. Development Workflow

* **Git Strategy**: Trunk-based development for speed, but enforced via Pull Requests.
* **Branching**: `feat/runbook-engine`, `fix/graph-rendering`, `chore/setup-docker`.
* **Commits**: Conventional Commits (e.g., `feat(graph): add blast radius animation`).
* **CI/CD**: GitHub Actions runs `pytest` and `eslint` on every PR.

---

## 8. Coding Standards

* **Naming Conventions**: 
  * Frontend: PascalCase for components (`GraphView.tsx`), camelCase for hooks (`useRunbook.ts`).
  * Backend: snake_case for Python variables and files (`shadow_simulator.py`), PascalCase for Classes.
* **Import Conventions**: Absolute imports configured via `tsconfig.json` (`@/features/graph`) and Python `PYTHONPATH`.
* **Error Handling**: 
  * Backend: Raise custom `HTTPException` subclasses. Never leak stack traces to the client.
  * Frontend: Global Error Boundaries and toast notification interceptors in Axios.
* **Logging**: Python `structlog` for JSON-formatted logs.

---

## 9. API Skeleton (Contracts)

* **`POST /api/v1/incidents/trigger`**: Ingest simulated anomaly. Returns `IncidentPayload`.
* **`GET /api/v1/graph/state`**: Returns current plant graph. Response: `GraphNode[]`, `GraphEdge[]`.
* **`POST /api/v1/simulation/run`**: Triggers shadow twin. Body: `IncidentPayload`. Returns `ShadowSimulationResult`.
* **`POST /api/v1/runbook/generate`**: LLM generation. Body: `MitigationPath`. Returns `RunbookSchema`.
* **`PUT /api/v1/runbook/{id}/step/{step_id}`**: Update step (e.g., mark failed). Returns updated `RunbookSchema`.
* **`GET /api/v1/compliance/export/{incident_id}`**: Returns a binary PDF Blob.

---

## 10. Backend Services (Class Skeletons)

* **`GraphService`**: Manages `NetworkX` graph. `calculate_blast_radius(node_id)`
* **`SimulationService`**: Forks graph state. `run_forward_simulation(graph, anomaly)`
* **`RAGService`**: Interfaces with Qdrant. `query_context(asset_ids)`
* **`ReasoningEngine`**: LLM Orchestrator. `evaluate_mitigation_paths(blast_radius, context)`
* **`RunbookCompiler`**: Deterministic JSON generation. `compile_action_steps(llm_decision)`
* **`DocumentProcessor`**: PDF OCR and chunking. `ingest_oem_manual(file)`

---

## 11. Frontend Component Hierarchy

```text
<App>
  <Sidebar> (Navigation: Dashboard, History, Compliance)
  <TopHeader> (Global alerts, system health)
  <WorkspaceLayout>
    <LeftPanel: CausalGraphView>
      <ReactFlowCanvas>
        <CustomAssetNode>
        <AnimatedFailureEdge>
    <RightPanel: ControlCenter>
      <IncidentFeed> (List of active anomalies)
      <ShadowSimulationModal> (Displays 3 mitigation paths)
      <RunbookPanel> (Active execution)
        <RunbookHeader>
        <StepList>
          <ActionCard> (Interactive checklist item)
            <CitationTooltip>
```

---

## 12. Database Design

* **Vector DB (Qdrant)**:
  * Collection: `industrial_knowledge`. 
  * Payload schema: `{"asset_id": "P-101", "doc_type": "OEM_MANUAL", "page": 42}`
* **Graph Storage (Hackathon)**: 
  * NetworkX state saved as serialized JSON to local disk (`graph_state.json`) for persistence across hot-reloads.
* **Future Migration**:
  * PostgreSQL (Incident logs, Runbook history).
  * Neo4j (Persistent Cypher-queryable causal graph).

---

## 13. Development Order (Implementation Roadmap)

* **Milestone 1**: Project Setup (Docker, Vite, FastAPI, CI/CD).
* **Milestone 2**: Static Causal Graph (NetworkX JSON -> React Flow UI).
* **Milestone 3**: Qdrant Vector Setup & Manual Ingestion pipeline.
* **Milestone 4**: The Shadow Simulation Engine (Calculate blast radius in Python).
* **Milestone 5**: LLM Reasoning Pipeline (Connecting RAG to Graph output).
* **Milestone 6**: Runbook Generator (Deterministic JSON parsing).
* **Milestone 7**: Frontend Runbook Execution UI (Checklists & state management).
* **Milestone 8**: Dynamic Feedback Loop (Mark step failed -> trigger recalculation).
* **Milestone 9**: Incident Telemetry Feed (Mock event emitter).
* **Milestone 10**: Compliance PDF Generator & Polish.

---
*Status: Engineering Foundation Finalized. Awaiting approval to proceed to Milestone 1.*
