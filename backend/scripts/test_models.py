import os
import requests
import json

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

def test_gemini(api_key, model_name):
    print(f"\n--- Testing Google Gemini ({model_name}) ---")
    if not api_key:
        print("[FAIL] Error: GEMINI_API_KEY is not set.")
        return False
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": "Say 'Gemini is active and online!' in one short sentence."}]}]
    }
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            text = data['candidates'][0]['content']['parts'][0]['text'].strip()
            print(f"[SUCCESS] Response: \"{text}\"")
            return True
        else:
            print(f"[FAIL] (HTTP {res.status_code}): {res.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Error during request: {e}")
        return False

def test_nvidia_nim(api_key, base_url, model_name):
    print(f"\n--- Testing NVIDIA NIM LLM ({model_name}) ---")
    if not api_key:
        print("[FAIL] Error: NIM_API_KEY is not set.")
        return False
    
    url = f"{base_url}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": "Say 'NVIDIA NIM is active and online!' in one short sentence."}],
        "max_tokens": 50
    }
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            text = data['choices'][0]['message']['content'].strip()
            print(f"[SUCCESS] Response: \"{text}\"")
            return True
        else:
            print(f"[FAIL] (HTTP {res.status_code}): {res.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Error during request: {e}")
        return False

def list_nvidia_models(api_key, base_url):
    print(f"\n--- Fetching Available NVIDIA NIM Models ---")
    if not api_key:
        print("[FAIL] Error: NIM_API_KEY is not set.")
        return
    
    url = f"{base_url}/models"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            data = res.json()
            models = [m['id'] for m in data.get('data', [])]
            print(f"[SUCCESS] Retrieved {len(models)} models from API.")
            
            # Print embedding/rerank models specifically
            embed_models = [m for m in models if "embed" in m.lower()]
            rerank_models = [m for m in models if "rerank" in m.lower()]
            
            print("\nAvailable Embedding Models:")
            for m in embed_models[:10]:
                print(f"  - {m}")
            
            print("\nAvailable Reranking Models:")
            for m in rerank_models[:10]:
                print(f"  - {m}")
                
            return models
        else:
            print(f"[FAIL] (HTTP {res.status_code}): {res.text}")
            return []
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return []

def test_nvidia_nim_embed(api_key, base_url, model_name):
    print(f"\n--- Testing NVIDIA NIM Embeddings ({model_name}) ---")
    if not api_key:
        print("[FAIL] Error: NIM_API_KEY is not set.")
        return False
    
    url = f"{base_url}/embeddings"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "input": "APEX decision intelligence engine",
        "model": model_name
    }
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            dim = len(data['data'][0]['embedding'])
            print(f"[SUCCESS] Generated embedding with dimension: {dim}")
            return True
        else:
            print(f"[FAIL] (HTTP {res.status_code}): {res.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Error during request: {e}")
        return False

if __name__ == "__main__":
    # Ensure we run from backend directory
    if os.path.exists("backend"):
        os.chdir("backend")
        
    env = load_env()
    
    gemini_key = env.get("GEMINI_API_KEY", "")
    gemini_model = env.get("GEMINI_MODEL", "gemini-2.5-flash")
    
    nim_key = env.get("NIM_API_KEY", "")
    nim_base = env.get("NIM_BASE_URL", "https://integrate.api.nvidia.com/v1")
    nim_model = env.get("NIM_REASONING_MODEL", "meta/llama-3.1-70b-instruct")
    nim_embed_model = env.get("NIM_EMBED_MODEL", "llama-nemotron-embed-1b-v2")
    
    test_gemini(gemini_key, gemini_model)
    test_nvidia_nim(nim_key, nim_base, nim_model)
    
    available_models = list_nvidia_models(nim_key, nim_base)
    if available_models:
        # Check if the configured embedding model exists or test one that does
        found_embed = False
        for m in available_models:
            if "embed" in m.lower() and ("nemotron" in m.lower() or "nv-embed" in m.lower()):
                test_nvidia_nim_embed(nim_key, nim_base, m)
                found_embed = True
                break
        if not found_embed:
            test_nvidia_nim_embed(nim_key, nim_base, nim_embed_model)
    else:
        test_nvidia_nim_embed(nim_key, nim_base, nim_embed_model)
