.PHONY: help install lint format typecheck test clean

help:  ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install pre-commit hooks
	pre-commit install
	cd frontend && npm install
	cd backend && pip install -r requirements-dev.txt

lint:  ## Run all linters (backend + frontend)
	cd backend && ruff check app/
	cd frontend && npm run lint

format:  ## Format all code (backend + frontend)
	cd backend && ruff format app/
	cd frontend && npm run format

typecheck:  ## Run type checkers (backend + frontend)
	cd backend && mypy app/
	cd frontend && npm run typecheck

test:  ## Run all tests (backend + frontend)
	cd backend && pytest tests/ -v --tb=short
	cd frontend && npm test

clean:  ## Clean build artifacts
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf backend/.pytest_cache backend/coverage.xml
	rm -rf frontend/dist frontend/coverage
