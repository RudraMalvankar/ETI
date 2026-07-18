# APEX: Autonomous Process Execution

**APEX** is an AI-powered Decision Intelligence platform for asset-intensive industrial plants. It shifts operators from passive document search to active, generative execution.

## The Problem
When a critical pipeline anomaly occurs, operators lose precious minutes searching through P&IDs, OEM manuals, and SOPs. Passive RAG chatbots aren't enough—stressed technicians don't have time to "chat" with their data.

## The Solution
APEX acts as an Industrial Autopilot. Upon detecting a telemetry anomaly, APEX:
1. **Forks a Shadow Twin:** Instantly simulates the causal failure propagation across the plant's equipment graph.
2. **Evaluates Paths:** Uses LLM-driven decision intelligence to evaluate multiple mitigation strategies against safety codes and historical data.
3. **Generates Runbooks:** Pushes an interactive, step-by-step executable runbook directly to a field technician's mobile device.
4. **Adapts Dynamically:** If a physical constraint is met (e.g., a valve is stuck), APEX instantly recalculates the graph and reroutes the checklist.

## Quick Start (Hackathon Local Environment)

### Prerequisites
* Node.js v18+
* Python 3.10+
* Docker (for Qdrant Vector DB)
* OpenAI API Key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add your OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Documentation
Please view the `/docs` directory for complete architectural and product details:
* `PRD.md`: Vision and Requirements
* `SYSTEM_ARCHITECTURE.md`: Technical diagrams
* `AI_PIPELINE.md`: Deep dive into our reasoning engine
* `DEMO_SCRIPT.md`: Our hackathon presentation flow
