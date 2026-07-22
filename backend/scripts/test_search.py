import json
import time

import requests

URL_UPLOAD = "http://localhost:8000/api/v1/documents/upload"
URL_INDEX = "http://localhost:8000/api/v1/documents/index"
URL_SEARCH = "http://localhost:8000/api/v1/search"
FILE_PATH = "tests/samples/sample_industrial.pdf"

# 1. Upload
print("1. Uploading document...")
with open(FILE_PATH, "rb") as f:
    files = {"file": ("sample_industrial.pdf", f, "application/pdf")}
    response = requests.post(URL_UPLOAD, files=files)
doc_response = response.json()
print("Upload Status:", response.status_code)

if response.status_code == 201:
    doc_id = doc_response["document_id"]

    # 2. Index
    print(f"\n2. Indexing document {doc_id}...")
    index_res = requests.post(URL_INDEX, json={"document_id": doc_id})
    print("Index Status:", index_res.status_code)
    print("Index Response:", json.dumps(index_res.json(), indent=2))

    # Give Qdrant a split second (though it's fast)
    time.sleep(0.5)

    # 3. Search
    print("\n3. Performing Semantic Search...")
    search_payload = {"query": "Pressure Valve issues", "top_k": 2}
    search_res = requests.post(URL_SEARCH, json=search_payload)
    print("Search Status:", search_res.status_code)
    print("Search Response:")
    print(json.dumps(search_res.json(), indent=2))
