import os
import socket
from urllib.parse import urlparse

from qdrant_client import QdrantClient
from sqlalchemy import create_engine


def load_env():
    env_vars = {}
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars


def test_database(db_url):
    print("\n--- Testing Database Connection (Neon Postgres) ---")
    if not db_url:
        print("[FAIL] DATABASE_URL not set in env.")
        return False

    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    try:
        engine = create_engine(db_url, connect_args=connect_args)
        with engine.connect():
            print("[SUCCESS] Connected to database successfully!")
            return True
    except Exception as e:
        print(f"[FAIL] Database connection failed: {e}")
        return False


def test_qdrant(qdrant_url, qdrant_api_key):
    print("\n--- Testing Qdrant Connection (Cloud Qdrant) ---")
    if not qdrant_url:
        print("[FAIL] QDRANT_URL is not set.")
        return False

    try:
        client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        cols = client.get_collections()
        print(
            f"[SUCCESS] Connected to Cloud Qdrant successfully! Available collections: {len(cols.collections)}"
        )
        return True
    except Exception as e:
        print(f"[FAIL] Qdrant connection failed: {e}")
        return False


def test_redis(redis_url):
    print("\n--- Testing Redis Connection (Cloud Redis) ---")
    if not redis_url:
        print("[FAIL] REDIS_URL not set in env.")
        return False

    try:
        # Parse connection string
        parsed = urlparse(redis_url)
        host = parsed.hostname
        port = parsed.port or 6379

        print(f"Pinging TCP port of Redis at {host}:{port}...")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        if result == 0:
            print("[SUCCESS] TCP connection to Cloud Redis port succeeded!")
            sock.close()

            # Now try to use the redis python client if available
            try:
                import redis

                r = redis.from_url(redis_url)
                r.ping()
                print("[SUCCESS] Redis client ping command succeeded!")
            except Exception as re:
                print(f"[INFO] Redis client command test skipped/failed (but port is open): {re}")
            return True
        else:
            print(f"[FAIL] Could not connect to Redis TCP port {port}. Connection error: {result}")
            return False
    except Exception as e:
        print(f"[FAIL] Redis test failed: {e}")
        return False


if __name__ == "__main__":
    if os.path.exists("backend"):
        os.chdir("backend")

    env = load_env()

    db_url = env.get("DATABASE_URL", "")
    qdrant_url = env.get("QDRANT_URL", "")
    qdrant_api_key = env.get("QDRANT_API_KEY", "")
    redis_url = env.get("REDIS_URL", "")

    test_database(db_url)
    test_qdrant(qdrant_url, qdrant_api_key)
    test_redis(redis_url)
