# APEX Deployment & Orchestration Guide

## Multi-Stage Docker Builds

The APEX platform uses optimized multi-stage Containerfiles for both backend and frontend.

### 1. Backend Container (`backend/Dockerfile`)
```dockerfile
# Build Stage: Install build tools and compile dependencies
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final Stage: Copy built artifacts into minimal runtime image
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local /usr/local
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Docker Compose Local Infrastructure (`docker-compose.yml`)

Run complete stack locally:
```bash
docker-compose up --build -d
```

Services exposed:
- `backend`: `http://localhost:8000` (FastAPI REST & WebSockets)
- `frontend`: `http://localhost:5173` (Vite / React Web Application)
- `qdrant`: `http://localhost:6333` (Vector DB)
- `redis`: `redis://localhost:6379/0` (Cache & Celery Broker)

## Production Deployment Checklist

1. Set `ENVIRONMENT=production` in environment variables.
2. Provide explicit `JWT_SECRET_KEY` string.
3. Configure domain-restricted `CORS_ORIGINS` (never wildcard `*` in production).
4. Run database migrations using Alembic.
5. Deploy behind a reverse proxy (e.g. Nginx or Cloudflare) with TLS 1.3 termination.
