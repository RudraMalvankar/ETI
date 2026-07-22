from prometheus_client import CollectorRegistry, Counter, Histogram

# Custom registry for the application metrics
metrics_registry = CollectorRegistry()

# 1. Request Metrics
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total count of HTTP requests processed by path and method",
    ["method", "path", "status"],
    registry=metrics_registry,
)

HTTP_REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "Histogram of request processing duration in seconds",
    ["method", "path"],
    registry=metrics_registry,
)

# 2. AI Metrics
AI_REQUESTS_TOTAL = Counter(
    "ai_requests_total",
    "Total count of AI requests processed by provider and model",
    ["provider", "model"],
    registry=metrics_registry,
)

AI_REQUEST_DURATION = Histogram(
    "ai_request_duration_seconds",
    "Histogram of AI generation latency in seconds",
    ["provider", "model"],
    registry=metrics_registry,
)

# 3. Database Metrics
DB_OPERATIONS_TOTAL = Counter(
    "db_operations_total",
    "Total database operation executions by action type",
    ["action"],
    registry=metrics_registry,
)

# 4. Celery Background Job Metrics
CELERY_JOBS_TOTAL = Counter(
    "celery_jobs_total",
    "Total count of Celery tasks executed by name and status",
    ["name", "status"],
    registry=metrics_registry,
)
