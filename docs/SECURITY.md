# APEX Security & Compliance Policy (v1.0.0)

## Security Architecture

APEX follows defense-in-depth security principles to protect sensitive industrial telemetry and operational manuals.

---

## Authentication & Session Security

1. **JWT Signature & Claims**:
   - Access tokens use SHA-256 HMAC (`HS256`).
   - `JWT_SECRET_KEY` is enforced to be at least 32 bytes (64-char hex recommended).
   - Token payload includes `sub` (User ID), `role`, `exp` (Expiry), and `jti` (Unique Token ID).
2. **Session Invalidation**:
   - Logout registers the token's `jti` into Redis token blacklist until token expiration.
3. **Rate Limiting**:
   - Authentication endpoints (`/api/v1/auth/login`) are rate-limited to 5 attempts per minute per IP using `slowapi`.

---

## Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Role Required | `Operator` | `Engineer` | `Auditor` | `Admin` |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Search & Simulation | `Operator`+ | ✅ | ✅ | ✅ | ✅ |
| Runbook Execution | `Operator`+ | ✅ | ✅ | ❌ | ✅ |
| Document Upload & Index | `Engineer`+ | ❌ | ✅ | ❌ | ✅ |
| Memory Store | `Engineer`+ | ❌ | ✅ | ❌ | ✅ |
| Compliance Reports | `Auditor`+ | ❌ | ❌ | ✅ | ✅ |
| Audit Logs | `Auditor`+ | ❌ | ❌ | ✅ | ✅ |
| Knowledge Graph Build | `Admin` | ❌ | ❌ | ❌ | ✅ |

---

## Data Compliance Standards

APEX automatically formats incident audit reports to comply with global industrial safety standards:
- **OISD-STD-117**: Oil Industry Safety Directorate guidelines for fire protection and emergency shutdown.
- **PESO Rule 14**: Petroleum and Explosives Safety Organisation pressure vessel certification regulations.
- **Factory Act Section 31**: Industrial plant machinery safety and dangerous operation protocols.
