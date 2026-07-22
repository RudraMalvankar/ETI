import structlog
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.database.session import Base, engine
from app.core.error_handlers import register_exception_handlers
from app.core.rate_limiter import limiter
from app.core.websockets import global_connection_manager
from app.middleware.audit import EnterpriseAuditMiddleware
from app.middleware.logging import RequestLoggingMiddleware
from app.models import blacklist as _blacklist_models  # noqa: F401
from app.models import models as _core_models  # noqa: F401

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

# SlowAPI limiters integration
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

register_exception_handlers(app)

# CORS — uses configured origins from settings (never wildcard in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / response structured logging and mutation auditing
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(EnterpriseAuditMiddleware)


@app.on_event("startup")
async def on_startup():
    Base.metadata.create_all(bind=engine)
    logger.info(
        "apex_startup",
        environment=settings.ENVIRONMENT,
        ai_provider=settings.AI_PROVIDER,
        qdrant_mode=settings.qdrant_mode,
    )


@app.get("/health")
def root_health_check():
    """Root liveness probe for Load Balancers and Container Orchestrators."""
    return {
        "status": "ok",
        "service": "apex-backend",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "qdrant_mode": settings.qdrant_mode,
    }


@app.get("/api/v1/health")
def health_check():
    """Core liveness probe for Docker and CI/CD pipelines."""
    return {
        "status": "ok",
        "service": "apex-backend",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "qdrant_mode": settings.qdrant_mode,
    }


@app.get("/live")
def liveness_probe():
    """Kubernetes/Docker liveness probe — always returns 200 if process is running."""
    return {"status": "alive", "service": "apex-backend"}


@app.get("/ready")
def readiness_probe():
    """Kubernetes/Docker readiness probe — checks DB connectivity before accepting traffic."""
    from fastapi.responses import JSONResponse

    from app.database.session import SessionLocal

    checks: dict = {"database": "unknown", "status": "ok"}
    all_ok = True

    # Check database connectivity
    try:
        db = SessionLocal()
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db.close()
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {str(exc)[:80]}"
        all_ok = False

    status_code = 200 if all_ok else 503
    checks["status"] = "ready" if all_ok else "not_ready"
    return JSONResponse(content=checks, status_code=status_code)


@app.websocket("/ws/simulation")
async def ws_simulation_endpoint(websocket: WebSocket):
    await global_connection_manager.connect(websocket)
    try:
        while True:
            # Maintain connection alive, listen for messages
            data = await websocket.receive_text()
            await websocket.send_json({"status": "received", "data": data})
    except WebSocketDisconnect:
        global_connection_manager.disconnect(websocket)


@app.get("/metrics")
def metrics():
    """Endpoint exposing Prometheus metrics collected from registry."""
    from fastapi.responses import Response
    from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

    from app.core.metrics import metrics_registry

    return Response(content=generate_latest(metrics_registry), media_type=CONTENT_TYPE_LATEST)


app.include_router(api_router, prefix="/api/v1")
