# APEX Authentication & Authorization (RBAC) Specification

## Security Principles

1. **No Hardcoded Secrets**: Secrets (`JWT_SECRET`, `JWT_SECRET_KEY`) must strictly be provided via environment variables. Missing keys raise a `RuntimeError` at startup.
2. **Role Self-Escalation Prevention**: Public self-registration (`POST /api/v1/auth/register`) forces the user role to `"Operator"`. Privilege elevation to `"Engineer"` or `"Admin"` must be performed by an authenticated Administrator.
3. **Session Revocation**: User models track `current_session_id`. Revocation or password reset invalidates old active tokens immediately.
4. **Password Reset Verification**: Password reset (`POST /api/v1/auth/reset-password`) requires authentication and valid `old_password` verification.

## Role-Based Access Control (RBAC) Matrix

| Endpoint Area | Allowed Roles | Access Level |
| :--- | :--- | :--- |
| `POST /api/v1/auth/register` | Public | Self-registration (Operator role enforced) |
| `POST /api/v1/auth/login` | Public | Generates JWT bearer access token |
| `GET /api/v1/audit/` | `Auditor`, `Admin` | Compliance audit trail view |
| `GET /api/v1/compliance/*` | `Auditor`, `Admin` | Compliance reports & export |
| `POST /api/v1/decision/recommend` | `Operator`, `Engineer`, `Admin` | Generate operational decision recommendation |
| `POST /api/v1/graph/build` | `Engineer`, `Admin` | Modify or rebuild knowledge graph topology |
| `GET /api/v1/graph/*` | `Operator`, `Engineer`, `Auditor`, `Admin` | Read topology, blast-radius, and paths |
| `POST /api/v1/simulation/run` | `Operator`, `Engineer`, `Admin` | Execute shadow simulation scenarios |
| `POST /api/v1/runbook/generate` | `Operator`, `Engineer`, `Admin` | Generate step-by-step mitigation runbook |
| `POST /api/v1/memory/store` | `Engineer`, `Admin` | Store operational incident memory |
| `GET /api/v1/memory/*` | `Operator`, `Engineer`, `Auditor`, `Admin` | Query operational incident memory & trends |
