"""
APEX Request Logging Middleware
=================================
Logs every incoming HTTP request and outgoing response with:
- request_id, user_id, endpoint, execution_time, status_code
- Structured JSON output via structlog
"""

import time
import uuid

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.metrics import HTTP_REQUEST_DURATION, HTTP_REQUESTS_TOTAL

logger = structlog.get_logger("apex.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()

        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Attempt extracting user_id if token is present
        user_id = getattr(request.state, "user_id", "anonymous")

        response = await call_next(request)

        duration_sec = time.perf_counter() - start
        execution_time_ms = round(duration_sec * 1000, 2)

        response.headers["X-Request-ID"] = request_id

        logger.info(
            "http_request",
            request_id=request_id,
            user_id=user_id,
            endpoint=request.url.path,
            method=request.method,
            status_code=response.status_code,
            execution_time=f"{execution_time_ms}ms",
            client=request.client.host if request.client else "unknown",
        )

        # Record metrics (ignoring system telemetry endpoints metrics noise)
        path = request.url.path
        if not path.startswith("/ws") and not path.endswith("/metrics"):
            HTTP_REQUESTS_TOTAL.labels(
                method=request.method, path=path, status=str(response.status_code)
            ).inc()
            HTTP_REQUEST_DURATION.labels(method=request.method, path=path).observe(duration_sec)

        return response
