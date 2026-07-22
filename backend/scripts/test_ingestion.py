import json

import requests

URL = "http://localhost:8000/api/v1/documents/upload"
FILE_PATH = "tests/samples/sample_industrial.pdf"

with open(FILE_PATH, "rb") as f:
    files = {"file": ("sample_industrial.pdf", f, "application/pdf")}
    print("Uploading document...")
    response = requests.post(URL, files=files)

print("Status Code:", response.status_code)
doc_response = response.json()
print("Upload Response:", json.dumps(doc_response, indent=2))

if response.status_code == 201:
    doc_id = doc_response["document_id"]
    print(f"\nFetching parsed document {doc_id}...")
    get_response = requests.get(f"http://localhost:8000/api/v1/documents/{doc_id}")
    print("Parsed JSON Output:")
    print(json.dumps(get_response.json(), indent=2))
