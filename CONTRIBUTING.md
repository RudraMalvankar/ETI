# Contributing to APEX

Thank you for your interest in contributing to **APEX (AI-Powered Industrial Incident & Decision Intelligence Platform)**! APEX is an enterprise-grade AI system designed for mission-critical industrial incident reasoning.

We welcome contributions from open-source developers, industrial engineers, AI researchers, and security specialists.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to `security@apex-ai.org`.

---

## How Can I Contribute?

### 1. Reporting Bugs
- Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
- Include exact steps to reproduce, Python/Node versions, OS, and failure stack traces.

### 2. Suggesting Enhancements
- Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).
- Clearly describe the feature, industrial use-case benefit, and proposed architecture.

### 3. Submitting Pull Requests
- Branch from `main` with descriptive names: `feature/your-feature`, `fix/issue-description`.
- Follow the repository formatting and linting rules:
  - **Backend**: `black`, `isort`, `ruff`, `mypy`. All pytest tests must pass (`python -m pytest`).
  - **Frontend**: `prettier`, `eslint`, `npx tsc --noEmit`. All vitest tests must pass (`npx vitest run`).
- Write clear, concise commit messages.
- Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## Development Setup

```bash
# Clone the repository
git clone https://github.com/RudraMalvankar/ETI.git
cd ETI

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements-dev.txt

# Frontend setup
cd ../frontend
npm install
```

---

## Development Standards & Quality Gates

Before opening a Pull Request, verify that all local checks pass:

```bash
# Backend Quality Checks
cd backend
python -m pytest
black --check .
isort --check .
ruff check .
mypy app/

# Frontend Quality Checks
cd ../frontend
npm test
npx tsc --noEmit
npm run build
```

---

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
