# System Architecture

This document describes the high-level system architecture and data flows of the APEX platform.

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Data Sources
        A[Plant P&IDs & Schematics] --> |Parsed| E
        B[OEM Manuals & SOPs] --> |Chunked/Embedded| D[(Vector DB: Qdrant)]
        C[Historical Incident Logs] --> |Embedded| D
    end

    subgraph Core Engine: APEX Backend (FastAPI)
        E[(Causal Graph DB: NetworkX)]
        F[Event Listener / Telemetry Ingestion]
        G[Shadow Simulation Engine]
        H[LLM Reasoning Core: GPT-4o]
        I[Dynamic Runbook Generator]
        
        F --> |Anomaly Detected| G
        G <--> |Query relationships| E
        G --> |Calculate Blast Radius| H
        H <--> |Fetch context| D
        H --> |Determine Mitigation Strategy| I
    end

    subgraph Client Application (React/Vite)
        J[Control Room Dashboard]
        K[Interactive Causal Map]
        L[Field Technician Runbook UI]
        M[Compliance Engine]

        I --> |WebSockets / REST| J
        J --> K
        I --> |Push Notification| L
        L --> |User Input: Step Failed| G
        L --> |Task Complete| M
    end
```

## 2. Core Modules Explained

### 2.1 The Shadow Simulation Engine (The Brain)
Unlike traditional RAG systems that wait for a user query, this engine is reactive. 
* **Input:** A JSON payload representing an anomaly (e.g., `{"asset_id": "P-101", "sensor": "vibration", "value": 14.5, "status": "critical"}`).
* **Action:** It traverses the Causal Graph (NetworkX) to find all downstream components connected to `P-101`. It extracts the current operational state of those components.
* **Output:** A "Blast Radius" subgraph.

### 2.2 LLM Reasoning Core (Decision Intelligence)
* **Input:** The Blast Radius subgraph + retrieved OEM limits from the Vector DB.
* **Action:** Prompts the LLM with a highly engineered system prompt instructing it to act as a Principal Plant Engineer. It evaluates 2-3 potential mitigation paths (e.g., Isolate vs. Bypass).
* **Output:** A selected mitigation path with a confidence score and financial impact estimation.

### 2.3 Dynamic Runbook Generator
* **Input:** The selected mitigation path.
* **Action:** Converts the theoretical path into a JSON array of actionable steps tailored for a field technician.
* **Schema:**
  ```json
  {
    "runbook_id": "RB-9092",
    "title": "Emergency Isolation of P-101",
    "steps": [
      {
        "step_id": 1,
        "action": "Close suction valve HV-101",
        "asset": "HV-101",
        "requires_loto": true,
        "citation": "P-101 OEM Manual, pg 42"
      }
    ]
  }
  ```

### 2.4 Field Technician UI & Feedback Loop
* The UI parses the Runbook JSON into interactive cards.
* If the user clicks **"Report Issue: Valve Stuck"** on Step 1, the UI sends a REST `POST` back to the Shadow Simulation Engine.
* The Engine updates the Graph (`HV-101.state = "stuck"`), and re-triggers the LLM Reasoning Core to find a new path (e.g., "Isolate upstream at HV-099"). The Runbook UI updates instantly.

## 3. Security & Deployment Architecture
* **Frontend:** Hosted on Vercel. Communicates via HTTPS.
* **Backend:** Hosted on AWS EC2 / Render. Validates JWT tokens for role-based access control (Engineer vs. Technician views).
* **Data Privacy:** Sensitive OEM documents are processed locally/in-VPC. LLM calls to OpenAI are stripped of proprietary PII where possible, utilizing strict system guardrails.
