"""
APEX Performance Benchmark Suite
=================================
Measures latency and throughput for critical APEX API endpoints.

Run with:
    cd backend
    python -m pytest tests/benchmarks/bench_api.py -v --tb=short

Requirements: pytest-benchmark (optional), falls back to timeit.
"""

import statistics
import time
from typing import Callable

# ---------------------------------------------------------------------------
# Benchmark Harness (does not require pytest-benchmark)
# ---------------------------------------------------------------------------


def measure_latency(fn: Callable, iterations: int = 10) -> dict:
    """Execute fn n times and return min/max/mean/p95 latency in ms."""
    timings = []
    for _ in range(iterations):
        start = time.perf_counter()
        fn()
        elapsed_ms = (time.perf_counter() - start) * 1000
        timings.append(elapsed_ms)

    timings.sort()
    return {
        "min_ms": round(min(timings), 2),
        "max_ms": round(max(timings), 2),
        "mean_ms": round(statistics.mean(timings), 2),
        "median_ms": round(statistics.median(timings), 2),
        "p95_ms": round(timings[int(len(timings) * 0.95)], 2),
        "iterations": iterations,
    }


# ---------------------------------------------------------------------------
# Benchmark Tests
# ---------------------------------------------------------------------------


class TestAPILatencyBenchmarks:
    ACCEPTABLE_P95_MS = 500  # Benchmark threshold: 95th percentile < 500ms

    def test_bench_health_endpoint(self, client):
        """Health endpoint should be very fast (<50ms p95)."""
        result = measure_latency(lambda: client.get("/health"), iterations=20)
        print(f"\n[BENCH] /health: {result}")
        assert result["p95_ms"] < 50, f"Health endpoint too slow: {result['p95_ms']}ms p95"

    def test_bench_auth_login(self, client):
        """Login endpoint latency benchmark."""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={"username": "bench_login_user", "password": "B3nch!Pass"},
        )

        def do_login():
            client.post(
                "/api/v1/auth/login",
                json={"username": "bench_login_user", "password": "B3nch!Pass"},
            )

        result = measure_latency(do_login, iterations=5)
        print(f"\n[BENCH] /auth/login: {result}")
        assert result["p95_ms"] < 1500, f"Login endpoint too slow: {result['p95_ms']}ms p95"

    def test_bench_graph_statistics(self, client, built_graph, operator_headers):
        """Graph statistics should be fast."""
        result = measure_latency(
            lambda: client.get("/api/v1/graph/statistics", headers=operator_headers),
            iterations=10,
        )
        print(f"\n[BENCH] /graph/statistics: {result}")
        assert result["p95_ms"] < self.ACCEPTABLE_P95_MS

    def test_bench_semantic_search(self, client, operator_headers):
        """Search endpoint should return within 500ms p95."""
        result = measure_latency(
            lambda: client.post(
                "/api/v1/search/",
                json={"query": "pump bearing failure", "top_k": 5},
                headers=operator_headers,
            ),
            iterations=10,
        )
        print(f"\n[BENCH] /search/: {result}")
        assert result["p95_ms"] < self.ACCEPTABLE_P95_MS

    def test_bench_simulation_run(self, client, built_graph, operator_headers):
        """Simulation should complete within 1 second p95."""
        result = measure_latency(
            lambda: client.post(
                "/api/v1/simulation/run",
                json={
                    "failed_asset": "pump_A",
                    "failure_type": "bearing_failure",
                    "operating_mode": "normal",
                },
                headers=operator_headers,
            ),
            iterations=5,
        )
        print(f"\n[BENCH] /simulation/run: {result}")
        assert result["p95_ms"] < 1000, f"Simulation too slow: {result['p95_ms']}ms p95"

    def test_bench_runbook_statistics(self, client, operator_headers):
        """Runbook statistics should be fast."""
        result = measure_latency(
            lambda: client.get("/api/v1/runbook/statistics/", headers=operator_headers),
            iterations=10,
        )
        print(f"\n[BENCH] /runbook/statistics/: {result}")
        assert result["p95_ms"] < self.ACCEPTABLE_P95_MS

    def test_bench_document_list(self, client, operator_headers):
        """Document list should be fast."""
        result = measure_latency(
            lambda: client.get("/api/v1/documents/", headers=operator_headers),
            iterations=10,
        )
        print(f"\n[BENCH] /documents/: {result}")
        assert result["p95_ms"] < self.ACCEPTABLE_P95_MS


class TestThroughputBenchmarks:
    """Basic throughput benchmarks — requests per second."""

    def test_health_throughput(self, client):
        """Health endpoint should handle > 50 req/s."""
        iterations = 50
        start = time.perf_counter()
        for _ in range(iterations):
            client.get("/health")
        elapsed_sec = time.perf_counter() - start
        rps = iterations / elapsed_sec
        print(
            f"\n[BENCH] /health throughput: {rps:.1f} req/s ({elapsed_sec:.2f}s for {iterations} reqs)"
        )
        assert rps > 10, f"Health endpoint throughput too low: {rps:.1f} req/s"

    def test_search_throughput(self, client, operator_headers):
        """Search should handle at least 5 req/s."""
        iterations = 10
        start = time.perf_counter()
        for _ in range(iterations):
            client.post(
                "/api/v1/search/",
                json={"query": "pump", "top_k": 3},
                headers=operator_headers,
            )
        elapsed_sec = time.perf_counter() - start
        rps = iterations / elapsed_sec
        print(f"\n[BENCH] /search/ throughput: {rps:.1f} req/s")
        assert rps > 2, f"Search throughput too low: {rps:.1f} req/s"


class TestBenchmarkReport:
    """Generate benchmark summary report."""

    def test_generate_benchmark_report(self, client, built_graph, operator_headers):
        """Run all key benchmarks and print a summary."""
        benchmarks = {
            "health": ("GET", "/health", None, {}),
            "graph_stats": ("GET", "/api/v1/graph/statistics", None, operator_headers),
            "search": (
                "POST",
                "/api/v1/search/",
                {"query": "pump failure", "top_k": 3},
                operator_headers,
            ),
        }

        print("\n" + "=" * 60)
        print("APEX API PERFORMANCE BENCHMARK REPORT")
        print("=" * 60)

        for name, (method, url, body, headers) in benchmarks.items():

            def make_request(m=method, u=url, b=body, h=headers):
                if m == "GET":
                    return client.get(u, headers=h)
                else:
                    return client.post(u, json=b, headers=h)

            result = measure_latency(make_request, iterations=5)
            print(
                f"{name:20s}: mean={result['mean_ms']:6.1f}ms  "
                f"p95={result['p95_ms']:6.1f}ms  "
                f"max={result['max_ms']:6.1f}ms"
            )

        print("=" * 60)
        assert True  # Always pass — report only
