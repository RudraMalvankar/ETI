import os

import requests


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


def test_nvidia_nim_embed(api_key, base_url, model_name):
    print(f"\n--- Testing NVIDIA NIM Embeddings ({model_name}) ---")
    if not api_key:
        print("[FAIL] Error: NIM_API_KEY is not set.")
        return False

    url = f"{base_url}/embeddings"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
    payload = {"input": "APEX decision intelligence engine", "model": model_name}

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            dim = len(data["data"][0]["embedding"])
            print(f"[SUCCESS] Generated embedding with dimension: {dim}")
            return True
        else:
            print(f"[FAIL] (HTTP {res.status_code}): {res.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Error during request: {e}")
        return False


if __name__ == "__main__":
    if os.path.exists("backend"):
        os.chdir("backend")

    env = load_env()
    nim_key = env.get("NIM_API_KEY", "")
    nim_base = env.get("NIM_BASE_URL", "https://integrate.api.nvidia.com/v1")

    # Try multiple models from list
    models_to_try = [
        "nvidia/llama-nemotron-embed-1b-v2",
        "nvidia/embed-qa-4",
        "nvidia/nv-embedqa-e5-v5",
        "nvidia/nv-embed-v1",
    ]

    for model in models_to_try:
        test_nvidia_nim_embed(nim_key, nim_base, model)
