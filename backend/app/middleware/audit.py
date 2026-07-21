from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.compliance.AuditLogService import AuditLogService
from jose import jwt
from app.core.auth import JWT_SECRET, JWT_ALGORITHM

class EnterpriseAuditMiddleware(BaseHTTPMiddleware):
    """
    Middleware that intercepts mutation requests (POST/PUT/DELETE)
    and logs actions, resources, users, and client IPs to the database.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # 1. Determine user identity from headers
        username = "Anonymous"
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                username = payload.get("sub", "Anonymous")
            except Exception:
                pass

        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        # 2. Proceed with API request execution
        response = await call_next(request)

        # 3. Log mutation operations (exclude GET/HEAD, focus on successful creations/modifications)
        if method in ["POST", "PUT", "DELETE"] and response.status_code in [200, 201, 204]:
            action_map = {
                "POST": "Create",
                "PUT": "Update",
                "DELETE": "Delete"
            }
            action = f"{action_map.get(method, 'Modify')} Resource"
            
            # Refine action names based on path patterns
            if "auth/register" in path:
                action = "User Creation"
            elif "auth/login" in path:
                action = "Login"
            elif "auth/logout" in path:
                action = "Logout"
            elif "documents" in path:
                action = "Document Upload" if method == "POST" else "Document Delete"
            elif "simulation" in path:
                action = "Incident Simulation Trigger"
            elif "decision" in path:
                action = "AI Decisions Inquiry"
            elif "runbook" in path:
                action = "Runbook Execution Update" if method == "PUT" else "Runbook Generation"
            elif "memory" in path:
                action = "Incident Creation" if method == "POST" else "Incident Update"

            AuditLogService.log(
                username=username,
                ip_address=client_ip,
                action=action,
                resource=path,
                previous_value=None,
                new_value={"status_code": response.status_code}
            )

        return response
