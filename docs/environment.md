# APEX Environment Variable Reference

All configuration variables are loaded and validated using `pydantic-settings` in `app/core/config.py`.

## Configuration Parameters

| Variable Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | String | `development` | Environment mode (`development`, `staging`, `production`) |
| `LOG_LEVEL` | String | `INFO` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `AI_PROVIDER` | String | `mock` | Active AI provider (`mock`, `gemini`, `nim`) |
| `GEMINI_API_KEY` | String | `""` | Google Gemini API key (required if `AI_PROVIDER=gemini`) |
| `GEMINI_MODEL` | String | `gemini-1.5-flash` | Gemini model identifier |
| `GEMINI_EMBEDDING_MODEL` | String | `text-embedding-004` | Gemini vector embedding model |
| `NIM_API_KEY` | String | `""` | NVIDIA NIM API key (required if `AI_PROVIDER=nim`) |
| `NIM_BASE_URL` | String | `https://integrate.api.nvidia.com/v1` | NVIDIA NIM API endpoint URL |
| `NIM_MODEL` | String | `meta/llama-3.1-70b-instruct` | NVIDIA NIM model identifier |
| `QDRANT_HOST` | String | `""` | Hostname of Qdrant vector database (empty = in-memory mode) |
| `QDRANT_PORT` | Integer | `6333` | Port for Qdrant service |
| `QDRANT_COLLECTION` | String | `apex_documents` | Collection name for vector storage |
| `JWT_SECRET_KEY` | String | `""` | Secret key for signing JWT tokens |
| `DATABASE_URL` | String | `sqlite:///./apex.db` | SQLAlchemy database connection string |
| `REDIS_URL` | String | `redis://localhost:6379/0` | Redis connection URL for Celery & cache |
| `CORS_ORIGINS` | JSON List | `["http://localhost:3000", ...]` | Allowed CORS origins for web client |
