## Pull Request Checklist

### Description of Changes
Summarize the scope and technical intent of your PR.

### Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

### Quality Verification Checklist

#### Backend Checks
- [ ] Code passes all pytest tests (`python -m pytest`)
- [ ] Code is formatted with Black (`black --check .`)
- [ ] Imports are sorted with Isort (`isort --check .`)
- [ ] Linting passes with Ruff (`ruff check .`)
- [ ] Type checking passes with Mypy (`mypy app/`)

#### Frontend Checks
- [ ] Code passes all Vitest tests (`npx vitest run`)
- [ ] Code passes TypeScript check (`npx tsc --noEmit`)
- [ ] Production bundle compiles cleanly (`npm run build`)

### Related Issues
Fixes # (issue)
