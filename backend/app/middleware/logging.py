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

logger = structlog.get_logger("apex.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        
        response = await call_next(request)
        
        duration_ms = (time.perf_counter() - start) * 1000
        
        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
            client=request.client.host if request.client else "unknown",
        )
        
        return response
