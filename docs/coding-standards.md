# APEX Engineering & Coding Standards

## Python Backend Standards

1. **Formatting & Style**:
   - `black` with 100 character line length.
   - `isort` with black profile for clean import sorting.
   - `ruff` for fast static linting (`E`, `F`, `W`, `I` rules).

2. **Database Transactions**:
   - Never open manual `SessionLocal()` instances in services or route handlers without closing.
   - Always use `with get_db_context() as db:` for atomic commit/rollback context management outside FastAPI route injection.
   - Use `db: Session = Depends(get_db)` inside FastAPI endpoint routes.

3. **Exception Handling**:
   - Never use raw `print()` statements. Use `structlog.get_logger()` for structured event logging.
   - Raise specialized domain exceptions (`AIProviderError`, `VectorStoreError`, `DatabaseError`) from `app/core/exceptions.py`.
   - All HTTP error responses follow uniform JSON schema (`success`, `error`, `details`, `request_id`, `timestamp`).

4. **Type Safety & Models**:
   - Avoid `Any` and untyped `dict` parameters where possible. Use explicit Pydantic schemas or dataclasses.
   - All datetime values must be timezone-aware UTC (`datetime.now(timezone.utc)`).

## Frontend Standards

1. **TypeScript & React**:
   - Strict TypeScript checking (`tsconfig.json`).
   - `eslint` and `prettier` for code linting and formatting.
