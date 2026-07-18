# Hackathon Development Roadmap (8 Days)

This roadmap aggressively prioritizes features that maximize Judge Excitement and Demo Impact. We are dropping "nice-to-haves" in favor of "mind-blowing core flows."

## Phase 1: Infrastructure & Core Engine (Days 1-2)
* **Day 1: Scaffold & Graph Mocking**
  * Initialize Vite+React frontend and FastAPI backend.
  * Build the mocked NetworkX plant graph (approx. 20 nodes: Pumps, Valves, Heat Exchangers, Reactors).
  * Build the endpoint to calculate and return the "Blast Radius."
* **Day 2: AI Pipeline & RAG Setup**
  * Spin up local Qdrant container.
  * Ingest 3 dummy OEM PDFs and 1 safety standard PDF into vector space.
  * Write the GPT-4o reasoning prompt that takes the graph state and generates a JSON runbook.

## Phase 2: High-Fidelity UI & Visualization (Days 3-5)
* **Day 3: The Causal Graph**
  * Implement React Flow in the frontend.
  * Map the NetworkX JSON output to React Flow nodes/edges.
  * Add the red "glowing" animation for anomaly propagation.
* **Day 4: The Executable Runbook UI**
  * Build the Runbook Component (Checklist, inline citations).
  * Build the "Mobile Toggle" layout (a floating div sized like an iPhone).
* **Day 5: Dynamic Adaptation Loop**
  * Wire the "Mark Failed" button in the Runbook to send a POST back to the backend.
  * Ensure the UI seamlessly updates when the new Runbook is generated.

## Phase 3: The Polish & Demo Prep (Days 6-8)
* **Day 6: Compliance PDF & Final Features**
  * Build a simple HTML-to-PDF generator (e.g., using `jspdf` or browser print) that spits out the "Evidence Package."
* **Day 7: The Dry Run**
  * Write the simulated event payload (The "Push the Big Red Button" script).
  * Rehearse the 3-minute demo script exactly as written in `DEMO_SCRIPT.md`.
  * Fix all UI glitches (no loading spinners hanging, handle LLM latency gracefully).
* **Day 8: Pitch Deck & Video**
  * Record the backup demo video.
  * Finalize the pitch deck focusing on the "Decision Intelligence" USP.
