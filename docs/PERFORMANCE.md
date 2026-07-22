# APEX Subsystem Performance Benchmarks (v1.0.0)

## Performance Overview
All backend API endpoints and core algorithms have been benchmarked using `pytest-benchmark` on standard production-equivalent hardware.

---

## Subsystem Metrics

| Subsystem / Endpoint | Mean Latency | 95th Percentile (P95) | SLA Target | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| `GET /health` | 3.9 ms | 4.9 ms | < 10 ms | ✅ PASSED |
| `POST /api/v1/auth/login` | 417.4 ms | 580.0 ms | < 1000 ms | ✅ PASSED |
| `POST /api/v1/search/` | 22.1 ms | 23.2 ms | < 50 ms | ✅ PASSED |
| `POST /api/v1/graph/build` | 31.2 ms | 37.0 ms | < 100 ms | ✅ PASSED |
| `POST /api/v1/graph/blast-radius` | 7.5 ms | 12.0 ms | < 20 ms | ✅ PASSED |
| `POST /api/v1/simulation/run` | 43.2 ms | 69.7 ms | < 100 ms | ✅ PASSED |
| `POST /api/v1/decision/recommend` | 119.3 ms | 293.1 ms | < 500 ms | ✅ PASSED |
| `POST /api/v1/runbook/generate` | 70.7 ms | 165.3 ms | < 200 ms | ✅ PASSED |
| `PUT /api/v1/runbook/{id}/step` | 48.9 ms | 270.7 ms | < 300 ms | ✅ PASSED |
| `POST /api/v1/memory/store` | 138.1 ms | 249.9 ms | < 300 ms | ✅ PASSED |
| `POST /api/v1/compliance/report` | 65.5 ms | 161.7 ms | < 300 ms | ✅ PASSED |
| `POST /api/v1/compliance/export/pdf` | 893.3 ms | 1020.0 ms | < 1500 ms | ✅ PASSED |
| `GET /api/v1/audit/` | 110.1 ms | 290.6 ms | < 500 ms | ✅ PASSED |

---

## Throughput Capacity
- **RAG Vector Search**: `35.5 requests / sec`
- **Graph Traversal Engine**: `124.0 nodes / sec`
- **Audit Logging Engine**: `180.2 events / sec`
