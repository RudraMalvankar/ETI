import uuid
from datetime import datetime, timezone

import structlog
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import APEXException

logger = structlog.get_logger("apex.errors")


def build_error_response(
    request: Request, error_type: str, details: str, status_code: int
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    payload = {
        "success": False,
        "error": error_type,
        "detail": details,
        "details": details,
        "request_id": request_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    return JSONResponse(status_code=status_code, content=payload)


async def apex_exception_handler(request: Request, exc: APEXException) -> JSONResponse:
    logger.error("apex_domain_exception", error=exc.message, status_code=exc.status_code)
    return build_error_response(request, exc.__class__.__name__, exc.details, exc.status_code)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    logger.warning("http_exception", detail=exc.detail, status_code=exc.status_code)
    details = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return build_error_response(request, "HTTPException", details, exc.status_code)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.warning("request_validation_error", errors=exc.errors())
    return build_error_response(
        request, "ValidationError", "Invalid request body or parameters.", 422
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.error("database_exception", error=str(exc))
    return build_error_response(
        request, "DatabaseError", "A database operational error occurred.", 500
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.critical("unhandled_global_exception", error=str(exc))
    return build_error_response(
        request,
        "InternalServerError",
        "An unexpected internal server error occurred.",
        500,
    )


def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(APEXException, apex_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)
