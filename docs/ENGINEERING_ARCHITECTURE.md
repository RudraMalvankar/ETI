# APEX Engineering Architecture & Foundation Blueprint
*Status: FINALIZED & FROZEN*

This document defines the enterprise-grade foundation for the APEX platform. It dictates the repository structure, frontend/backend architecture, API contracts, database schemas, and the development roadmap.

---

## 1. Complete Repository Structure (Monorepo)

The repository uses a monorepo structure to keep the frontend, backend, and shared configurations tightly coupled during rapid development, while remaining cleanly separated for future microservice deployment.

```text
apex/
├── frontend/         # React + Vite application (User Interface)
├── backend/          # FastAPI application (Core Logic, AI, & Orchestration)
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

The frontend uses a **Feature-Based Architecture**. Files are grouped by business domain, ensuring high modularity.

```text
frontend/src/
├── app/              # App entry, global routing, global layout wrappers
├── assets/           # Images, SVGs, and fonts
├── components/       # Global reusable UI (Buttons, Modals, Inputs, Cards)
├── features/         # Feature modules (The core logic)
│   ├── graph/        # React Flow graph, node components, graph hooks
│   ├── runbook/      # Runbook panel, checklist items, dynamic routing logic
│   ├── dashboard/    # Incident feeds, telemetry widgets
│   ├── compliance/   # Audit trails, PDF generator
│   ├── telemetry/    # Live stream monitoring, anomaly overlays
│   ├── documents/    # OEM manual upload UI, processing status
│   └── settings/     # User preferences, mock configuration
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

The backend follows **Domain-Driven Design (DDD)** with strict separation of concerns across ingestion, processing, AI reasoning, and orchestration.

```text
backend/app/
├── api/              # FastAPI routers, endpoints, and dependency injection
│   └── v1/
│       ├── graph.py        # /api/v1/graph
│       ├── simulation.py   # /api/v1/simulation
│       ├── runbook.py      # /api/v1/runbook
│       ├── documents.py    # /api/v1/documents
│       ├── compliance.py   # /api/v1/compliance
│       ├── telemetry.py    # /api/v1/telemetry
│       └── health.py       # /api/v1/health
├── connectors/       # Data source integrations
│   ├── pdf/          # Local PDF file ingestion
│   ├── csv/          # Tabular historical data
│   ├── mqtt/         # Live sensor streams (IoT)
│   ├── opcua/        # Industrial control system data
│   └── mock/         # Synthetic event generators for demo purposes
├── core/             # App configuration, lifecycle events, globals
├── middleware/       # HTTP Request interception layer
│   ├── logging.py       # Structured request/response logging
│   ├── request_id.py    # Traceability for distributed logs
│   ├── timing.py        # API latency monitoring
│   ├── error_handler.py # Standardized error payloads (avoids stack trace leaks)
│   └── cors.py          # Cross-Origin configuration
├── orchestrator/     # The Heart of APEX (Coordinates all services)
│   ├── workflow.py      # Main pipeline execution runner
│   ├── pipeline.py      # Defines linear and branching execution DAGs
│   ├── context_builder.py# Aggregates graph, RAG, and telemetry state
│   └── state_manager.py # Tracks in-flight incidents and lock states
├── services/         # Isolated Business Logic Modules
│   ├── ai/           # Decision Intelligence logic
│   │   ├── prompts/       # Version-controlled prompt templates
│   │   ├── orchestrator/  # Multi-agent/chain definitions
│   │   ├── validators/    # Output format enforcement (Pydantic validation)
│   │   └── models/        # LLM client abstractions (OpenAI, Anthropic wrappers)
│   ├── graph/        # NetworkX Operations
│   │   ├── graph_builder.py     # Constructs graph from schematics
│   │   ├── graph_traversal.py   # BFS/DFS search utilities
│   │   ├── blast_radius.py      # Calculates downstream failure impacts
│   │   ├── pathfinder.py        # Identifies alternative routing options
│   │   ├── graph_serializer.py  # JSON export/import for UI and caching
│   │   └── graph_validator.py   # Ensures graph logical integrity
│   ├── ingestion/    # Document Processing Pipeline
│   │   ├── parser.py            # Entry point for doc parsing
│   │   ├── ocr.py               # Optical Character Recognition wrappers
│   │   ├── layout.py            # Detects sections, headers, and images
│   │   ├── table_extractor.py   # Tabular data parser
│   │   ├── chunker.py           # Text splitting (recursive, semantic)
│   │   └── metadata.py          # Tag extraction (Equipment IDs, standard codes)
│   ├── rag/          # Retrieval-Augmented Generation
│   │   ├── embeddings.py        # Text-to-vector embedding generation
│   │   ├── retriever.py         # Vector DB querying (Qdrant)
│   │   └── reranker.py          # Relevance scoring and sorting
│   ├── telemetry/    # Sensor Data & Event Processing
│   │   ├── mock_stream.py       # Generates synthetic IoT data for demo
│   │   ├── event_bus.py         # Internal pub/sub for sensor updates
│   │   ├── alert_generator.py   # Rule-based threshold anomaly detection
│   │   └── normalizer.py        # Standardizes raw data to APEX schemas
│   ├── simulation/   # Shadow Simulation logic and state forking
│   ├── runbook/      # Runbook generation and lifecycle rules
│   └── compliance/   # Standards mapping, evidence/PDF generation
├── models/           # SQLAlchemy ORM models (Future PostgreSQL)
├── schemas/          # Pydantic models for request/response validation
├── database/         # DB clients, sessions, migrations
├── utils/            # Generic helper functions
└── tests/            # Pytest suite
```

---

## 4. Orchestration Layer (The Heart of APEX)

The `orchestrator/` module ensures absolute decoupling of services. Services do not call each other directly; they are coordinated by the `Workflow` engine.

**Example Pipeline Flow:**
1. **Incident Trigger**: `telemetry/event_bus` detects an anomaly and notifies the Orchestrator.
2. **Shadow Simulation**: Orchestrator triggers `graph/blast_radius` to calculate physical impact.
3. **Context Builder**: Aggregates the blast radius, invokes `rag/retriever` to find OEM manuals, and fetches current lock states via `state_manager`.
4. **Decision Engine**: Passes context to `ai/models` to evaluate mitigation strategies.
5. **Validator**: `ai/validators` ensures the LLM output strictly adheres to safety schema constraints.
6. **Runbook Compiler**: Converts the validated decision into actionable `RunbookStep` objects.
7. **Compliance Generator**: Maps chosen steps to PESO/OISD standards.
8. **Operational Memory**: Writes the incident resolution to historical databases for future RAG retrieval.

---

## 5. API Skeleton (Contracts)

* `GET /api/v1/health`: Liveness and dependency checks.
* `POST /api/v1/telemetry/ingest`: Ingest simulated or real anomaly payloads.
* `GET /api/v1/graph/state`: Returns `GraphNode[]`, `GraphEdge[]`.
* `POST /api/v1/simulation/shadow-run`: Forks state and calculates `ShadowSimulationResult`.
* `POST /api/v1/runbook/generate`: Compiles LLM outputs to `RunbookSchema`.
* `PUT /api/v1/runbook/{id}/step/{step_id}`: Updates state (e.g., mark failed, recalculate).
* `POST /api/v1/documents/upload`: Passes binary payload to the Ingestion pipeline.
* `GET /api/v1/compliance/export/{incident_id}`: Generates audit-ready PDF.

---

## 6. Shared Types (Schemas)

* **`IncidentPayload`**: `{ incident_id, asset_id, timestamp, severity, sensor_data }`
* **`GraphNode`**: `{ node_id, type, label, status, telemetry_snapshot }`
* **`ShadowSimulationResult`**: `{ simulation_id, blast_radius_nodes, mitigation_paths[] }`
* **`MitigationPath`**: `{ path_id, safety_score, financial_impact, description }`
* **`RunbookSchema`**: `{ runbook_id, incident_id, steps: RunbookStep[], status }`

---

## 7. Database & Environment Configuration

* **Vector DB (Qdrant)**: Stores chunked manuals and incident history embeddings.
* **Graph Storage (Hackathon)**: NetworkX state persisted to `graph_state.json`.
* **Future Migration**: PostgreSQL for structured logs; Neo4j for massive distributed graph processing.

**`.env.example`**
```env
ENVIRONMENT=development
API_V1_STR=/api/v1
OPENAI_API_KEY=sk-xxxx
QDRANT_HOST=localhost
QDRANT_PORT=6333
CORS_ORIGINS=http://localhost:3000
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 8. Development Order (Implementation Roadmap)

* **Milestone 1**: Project Setup (Docker, Vite, FastAPI, CI/CD).
* **Milestone 2**: Ingestion & Connectors (Mock IoT stream, PDF processing hooks).
* **Milestone 3**: Graph Engine (NetworkX building, traversal, serialization).
* **Milestone 4**: Shadow Simulation Engine (Calculate blast radius in Python).
* **Milestone 5**: Vector DB & RAG Setup (Qdrant embeddings).
* **Milestone 6**: AI Decision Engine (Connecting Orchestrator to LLM).
* **Milestone 7**: Runbook Generator (Deterministic JSON compiling).
* **Milestone 8**: Frontend Graph UI & Telemetry Overlay.
* **Milestone 9**: Frontend Runbook Execution UI (Dynamic failure handling).
* **Milestone 10**: Compliance PDF Generator & Polish.
