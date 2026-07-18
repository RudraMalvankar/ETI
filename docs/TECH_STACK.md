# Technology Stack & Architecture Decisions

This document outlines the finalized technology stack for the APEX platform, tailored specifically for rapid hackathon development while maintaining the illusion and structure of an enterprise-grade product.

## 1. Frontend Architecture
**Selection: React.js + Vite + TailwindCSS + React Flow**

* **Framework:** Vite + React.js
  * *Why:* Blazing fast HMR, massive ecosystem, perfect for Single Page Applications (SPAs).
  * *Rejected:* Next.js (Too much server-side overhead for a highly interactive, client-heavy simulation UI), Vanilla CSS (Too slow to iterate and maintain consistency under time pressure).
* **Styling:** TailwindCSS + Framer Motion
  * *Why:* Utility classes allow for rapid implementation of a premium, glassmorphic dark-theme UI. Framer Motion provides effortless, cinematic animations for the causal graph rendering and alert popups.
* **Graph Visualization:** React Flow
  * *Why:* Production-ready, highly customizable node-based UI. We can build custom React components inside nodes to show live telemetry data.
  * *Rejected:* D3.js (Too complex/time-consuming), Cytoscape (Outdated aesthetics).
* **State Management:** Zustand
  * *Why:* Zero-boilerplate, highly performant global state, ideal for sharing live anomaly state between the Graph View and the Runbook View.
  * *Rejected:* Redux (Too verbose), Context API (Performance issues with rapid telemetry updates).

## 2. Backend & AI Integration Layer
**Selection: Python + FastAPI**

* **Framework:** FastAPI
  * *Why:* Python is the lingua franca of AI. FastAPI provides instant Swagger docs, async endpoints, and seamless integration with LangChain/NetworkX.
  * *Rejected:* Node.js/Express (Lacks native support for advanced data science/graph libraries), Go (Slower iteration speed).
* **Causal Graph Engine:** NetworkX (In-memory Python Graph)
  * *Why:* We need to simulate failure propagation rapidly. NetworkX allows us to build a directed acyclic graph (DAG) of the plant, calculate shortest paths, and find blast radii in milliseconds.
  * *Rejected:* Neo4j (Requires running a separate database container, overkill for a 5-minute hackathon demo). We will pitch NetworkX as our "in-memory cache" and Neo4j as the "production persistence layer."

## 3. AI & Data Pipeline
**Selection: OpenAI GPT-4o + Qdrant + LangChain**

* **Large Language Model:** OpenAI GPT-4o
  * *Why:* Unmatched speed, superior reasoning capabilities for complex causal logic, and flawless JSON structured output (critical for generating programmatic runbooks).
  * *Rejected:* Local LLMs like Llama-3 (Too slow for a live demo without heavy GPU optimization), Claude 3.5 Sonnet (Comparable, but GPT-4o's JSON mode is slightly more rigid for our specific checklist schema).
* **Vector Database:** Qdrant (Local Docker or Cloud)
  * *Why:* Extremely fast, supports complex payload filtering (e.g., "Find manuals for P-101 AND related to Thermal Dynamics").
  * *Rejected:* Pinecone (Cloud latency and network dependency), ChromaDB (Can be unstable with concurrent reads in Python).
* **Orchestration:** LangChain / LangGraph
  * *Why:* LangGraph allows us to build stateful, multi-actor agent workflows (e.g., Anomaly Agent -> Simulation Agent -> Runbook Agent).

## 4. Document Processing (Ingestion)
**Selection: PyMuPDF + unstructured.io**

* **Parsing:** unstructured.io
  * *Why:* Handles complex tables, lists, and hierarchical data in industrial PDFs better than standard text extractors.
  * *Rejected:* AWS Textract (Requires AWS setup and latency).

## 5. Deployment & Demo Infrastructure
**Selection: Vercel (Frontend) + Render/Ngrok (Backend)**

* *Strategy:* For the hackathon demo, we will run the backend locally with Ngrok to avoid cloud cold-starts and ensure 0 latency during the live pitch. The frontend will be hosted on Vercel for a professional URL.
