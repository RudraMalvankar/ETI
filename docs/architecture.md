# APEX System Architecture Guide (v1.0.0)

## Overview
APEX is architected as a modular, asynchronous micro-monolith designed for maximum resilience in mission-critical industrial deployment scenarios.

---

## High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (React 18 / TypeScript / Vite)"]
        UI[Industrial Dashboard UI]
        GraphCanvas[React Flow Graph Canvas]
        Metrics[Recharts Analytics]
    end

    subgraph API Gateway ["FastAPI Gateway & Security"]
        AuthMiddleware[JWT Authentication Middleware]
        RBACChecker[Role-Based Access Control]
        RateLimiter[Slowapi Rate Limiter]
    end

    subgraph Services ["Backend Core Subsystems"]
        DocEngine[Document Intelligence / PyMuPDF]
        RAGSearch[Qdrant RAG Vector Search]
        GraphFactory[NetworkX Knowledge Graph]
        ShadowSim[Monte Carlo Shadow Simulator]
        DecisionEngine[Gemini 1.5 Pro AI Decision Engine]
        RunbookEngine[Dynamic Runbook Generator]
        ComplianceEngine[ReportLab Compliance Generator]
        AuditLogger[Structured JSON Audit Logger]
    end

    subgraph Storage ["Enterprise Persistence Layer"]
        Postgres[(Neon PostgreSQL / SQLite)]
        Qdrant[(Cloud Qdrant Vector DB)]
        Redis[(Cloud Redis Cache / Blacklist)]
    end

    Client --> AuthMiddleware
    AuthMiddleware --> RBACChecker
    RBACChecker --> RateLimiter
    RateLimiter --> Services
    Services --> Storage
```

---

## Component Subsystems

### 1. Document Intelligence & Vector Index
- Extract text and structural layout from uploaded PDF and CSV industrial OEM manuals using PyMuPDF (`fitz`).
- Generate 384-dimensional dense vector embeddings via `SentenceTransformers` (`all-MiniLM-L6-v2`) or Google Gemini API.
- Index vector chunks into Qdrant vector database with metadata filtering (document ID, asset ID, section).

### 2. Knowledge Graph & Blast Radius Engine
- Construct directed asset topology graphs using NetworkX.
- Calculate downstream failure propagation pathways and blast radius impact scores.
- Dynamically render network graphs on frontend via React Flow.

### 3. Shadow Simulation Engine
- Execute Monte Carlo failure simulations based on real-time telemetry (temperature, vibration, pressure, current).
- Calculate financial downtime risk scores (0-10 scale) and estimated repair windows.

### 4. AI Decision Engine & Grounded Reasoning
- Synthesize simulation output, knowledge graph topology, and RAG context using Google Gemini 1.5 Pro.
- Return structured strategy recommendations with confidence scores (>90%) and exact document page citations.

### 5. Dynamic Runbook Engine & LOTO Lockout
- Generate step-by-step mitigation runbooks with safety Lock-Out/Tag-Out (LOTO) steps.
- Process real-time technician feedback; dynamically recalculate runbook pathways upon step failures.

### 6. Operational Memory & Audit Trail
- Record full incident lifecycle histories into operational memory.
- Provide compliance verification according to OISD, PESO, and Factory Act standards.
- Export formatted multi-page PDF compliance reports.
