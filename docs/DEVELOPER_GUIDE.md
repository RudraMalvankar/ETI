# APEX Developer & Contributor Guide (v1.0.0)

## Getting Started

This guide provides instructions for developers contributing to the APEX platform.

---

## Local Development Workflow

```bash
# Clone the repository
git clone https://github.com/RudraMalvankar/ETI.git
cd ETI

# Setup Backend Virtual Environment
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements-dev.txt

# Setup Frontend Node Packages
cd ../frontend
npm install
```

---

## Running Development Servers

```bash
# Terminal 1 - FastAPI Backend Server
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - React Vite Frontend Server
cd frontend
npm run dev
```

---

## Testing & Code Quality Gates

Developers must run all local quality gates prior to submitting a Pull Request:

```bash
# Backend Quality Checks
cd backend
python -m pytest -v
black --check .
isort --check .
ruff check .
mypy app/

# Frontend Quality Checks
cd ../frontend
npx vitest run
npx tsc --noEmit
npm run build
```

---

## Project Coding Standards

- **Python**: Follow PEP 8 guidelines. Type hints are required for all function arguments and return signatures.
- **TypeScript**: Use strict mode (`"strict": true`). Avoid explicit `any` types.
- **Git Commit Messages**: Use standard commit prefixes (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
