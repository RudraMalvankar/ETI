from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.middleware.logging import RequestLoggingMiddleware
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)

logger = structlog.get_logger("apex.startup")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Orchestrator for Shadow Simulation, RAG, and Runbook Generation",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# CORS — uses configured origins from settings (never wildcard in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / response structured logging
app.add_middleware(RequestLoggingMiddleware)


@app.on_event("startup")
async def on_startup():
    logger.info(
        "apex_startup",
        environment=settings.ENVIRONMENT,
        ai_provider=settings.AI_PROVIDER,
        qdrant_host=settings.QDRANT_HOST or "in-memory",
    )


@app.get("/health")
def root_health_check():
    """Root liveness probe for Load Balancers and Container Orchestrators."""
    return {
        "status": "ok",
        "service": "apex-backend",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
    }


@app.get("/api/v1/health")
def health_check():
    """Core liveness probe for Docker and CI/CD pipelines."""
    return {
        "status": "ok",
        "service": "apex-backend",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
    }


app.include_router(api_router, prefix="/api/v1")
