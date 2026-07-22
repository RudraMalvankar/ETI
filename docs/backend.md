# APEX Backend Architecture & Request Lifecycle

## Directory Layout

```text
backend/app/
├── api/v1/
│   ├── router.py                  # Core API v1 route aggregator
│   └── endpoints/                 # Modular domain route handlers
├── connectors/                    # Ingestion connectors (CSV, PDF)
├── core/
│   ├── auth.py                    # JWT authentication & RBAC RoleChecker
│   ├── config.py                  # Pydantic-Settings environment configuration
│   ├── error_handlers.py          # Unified JSON exception handlers
│   ├── exceptions.py              # APEX domain exception taxonomy
│   ├── metrics.py                 # Prometheus telemetry registry
│   ├── rate_limiter.py            # SlowAPI rate limiting configuration
│   └── websockets.py              # WebSocket connection manager
├── database/
│   ├── session.py                 # SQLAlchemy engine, get_db, & get_db_context
│   └── mock_store.py              # In-memory testing storage
├── middleware/
│   ├── audit.py                   # Enterprise audit logging middleware
│   └── logging.py                 # Structured HTTP request logging middleware
├── models/                        # SQLAlchemy database models
├── schemas/                       # Pydantic DTO request/response schemas
└── services/                      # Business logic domain engines
```

## Request Lifecycle

1. **Ingress**: HTTP request arrives at `FastAPI` app.
2. **Middleware Stack**:
   - `RequestLoggingMiddleware`: Assigns `request_id`, tracks duration.
   - `EnterpriseAuditMiddleware`: Intercepts state-modifying requests (`POST`, `PUT`, `DELETE`) for compliance logs.
   - `CORSMiddleware` & `RateLimiter`: Enforces origin policies and rate limits (`5/min` on sensitive routes).
3. **Authentication & RBAC**:
   - `Depends(get_current_user_payload)` decodes and validates JWT token and session ID.
   - `RoleChecker(["Admin", "Operator"])` verifies user role credentials.
4. **Service Execution**:
   - Route delegates execution to pure service engines (`SimulationEngine`, `DecisionEngine`, etc.).
   - Database operations run inside `with get_db_context() as db:` blocks for atomic commit/rollback.
5. **Egress**:
   - Endpoint returns typed Pydantic response models.
   - Handled exceptions return uniform JSON payloads with `request_id` and timestamp.
