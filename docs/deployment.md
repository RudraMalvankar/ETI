# APEX Production Deployment Guide (v1.0.0)

## Overview
APEX is packaged with Docker container definitions and Docker Compose for production deployments on Linux cloud instances (AWS EC2, GCP Compute, Azure VM).

---

## Environment Variables Configuration

Copy `.env.example` to `.env` in `backend/`:

```env
# Application Core
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=generate_minimum_64_character_random_hex_secret
JWT_SECRET_KEY=generate_minimum_64_character_random_hex_secret
ALLOWED_ORIGINS=https://apex.yourcompany.com

# Relational Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@ep-prod-123.neon.tech/apex_db?sslmode=require

# Vector Database (Cloud Qdrant)
QDRANT_URL=https://prod-qdrant-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key

# Cache & Event Bus (Cloud Redis)
REDIS_URL=rediss://default:your_redis_key@prod-redis.upstash.io:6379

# AI Providers
GEMINI_API_KEY=your_google_ai_studio_api_key
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key
```

---

## Docker Compose Production Deployment

```bash
# Clone repository on target server
git clone https://github.com/RudraMalvankar/ETI.git
cd ETI

# Build and start production container services in detached mode
docker-compose -f docker-compose.yml up -d --build

# Verify container status
docker-compose ps
```

---

## Reverse Proxy (Nginx) Configuration Example

```nginx
server {
    listen 443 ssl http2;
    server_name apex.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/apex.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apex.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
