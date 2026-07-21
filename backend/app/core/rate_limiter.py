import os
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

# Setup redis backend connection URL or fallback to memory strategy locally
REDIS_URL = os.environ.get("REDIS_URL", "memory://")

# Allow bypassing rate limiting during unit tests unless explicitly testing rate limits
TESTING = os.environ.get("TESTING", "0") == "1"

def custom_rate_key(request: Request) -> str:
    """
    Rate key generator that checks if a user is logged in (sub claim).
    Falls back to remote address (IP) if anonymous.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            from jose import jwt
            from app.core.auth import JWT_SECRET, JWT_ALGORITHM
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            username = payload.get("sub")
            if username:
                return f"user:{username}"
        except Exception:
            pass
    return f"ip:{get_remote_address(request)}"

limiter = Limiter(
    key_func=custom_rate_key,
    storage_uri=REDIS_URL,
    enabled=not TESTING
)

