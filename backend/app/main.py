from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# This is the core entry point for the APEX Decision Intelligence Engine

app = FastAPI(
    title="APEX Backend API", 
    version="1.0.0",
    description="Orchestrator for Shadow Simulation, RAG, and Runbook Generation"
)

# CORS configuration for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def root_health_check():
    """
    Root liveness probe for generic Load Balancers (ALB, Nginx) and Container Orchestrators (K8s).
    """
    return {"status": "ok", "service": "apex-backend", "orchestrator": "ready"}

@app.get("/api/v1/health")
def health_check():
    """
    Core liveness probe for Docker and CI/CD pipelines.
    """
    return {"status": "ok", "service": "apex-backend", "orchestrator": "ready"}
