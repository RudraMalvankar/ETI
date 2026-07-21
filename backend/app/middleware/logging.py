"""
APEX Request Logging Middleware
=================================
Logs every incoming HTTP request and outgoing response with:
- Method, path, status code, duration
- Structured JSON output via structlog
"""
import time
# pyrefly: ignore [missing-import]
import structlog
# pyrefly: ignore [missing-import]
from fastapi import Request, Response
# pyrefly: ignore [missing-import]
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.metrics import HTTP_REQUESTS_TOTAL, HTTP_REQUEST_DURATION

logger = structlog.get_logger("apex.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        
        response = await call_next(request)
        
        duration_sec = time.perf_counter() - start
        duration_ms = duration_sec * 1000
        
        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
            client=request.client.host if request.client else "unknown",
        )

        # Record metrics (ignoring system telemetry endpoints metrics noise)
        path = request.url.path
        if not path.startswith("/ws") and not path.endswith("/metrics"):
            HTTP_REQUESTS_TOTAL.labels(
                method=request.method,
                path=path,
                status=str(response.status_code)
            ).inc()
            HTTP_REQUEST_DURATION.labels(
                method=request.method,
                path=path
            ).observe(duration_sec)
        
        return response

