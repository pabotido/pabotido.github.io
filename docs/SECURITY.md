# Security Baseline and Current Coverage

This document describes implemented controls separately from controls that remain future work. It is not a production sign-off.

## Implemented foundation controls

- Passwords are hashed with Node.js `scrypt` using a random per-password salt. Session and reset tokens are random; the database stores their SHA-256 hashes.
- The session cookie is HttpOnly, SameSite=Lax, and Secure when `NODE_ENV=production`. Session lookup checks expiry, revocation and active user state.
- Logout requires a double-submit CSRF token. Authenticated user and organization controllers require the same cookie/header token for unsafe methods; safe methods bypass the CSRF check. The login response returns the CSRF token for the allowlisted web origin; it is not an authentication credential.
- Browser CORS is restricted to the configured `APP_URL` origin and enables credentials only for that origin.
- Login and password-reset request routes have shared Redis-backed IP limits. Failed-login counters are keyed by HMAC-SHA-256 of normalized email using `AUTH_SECRET`; five failed attempts block that key for the remainder of the 15-minute window.
- Authenticated API routes use server-side sessions and permission guards. User profile access has self/permission checks. Request validation rejects unknown properties.
- Helmet security headers, request IDs, and a generic API exception envelope are enabled. Production error responses do not include stack traces.
- Redis and authentication operations fail closed if the Redis dependency is unavailable.
- `.env` is ignored by Git; `.env.example` contains placeholders only. Never stage or publish real credentials.

## Threats and remaining work

| Threat | Current mitigation | Remaining verification/work |
|---|---|---|
| Credential stuffing | IP rate limits and per-email lockout via Redis; scrypt password hashes | Redis integration/load tests; administrator MFA is not implemented |
| Session theft/replay | Opaque token cookie, stored token hash, expiry/revocation, HttpOnly/SameSite/Secure in production | Session-management UI, rotation policy and E2E coverage |
| CSRF | Double-submit check on logout and authenticated user/organization routes; credentialed CORS allowlist | Verify all future mutating controllers use the guard; login/reset CSRF review |
| IDOR/BOLA | User self-access check; server-side permission guard | Department/team data scopes and cross-user integration tests |
| SQL injection | Prisma parameterized operations | Database integration tests and review of future raw queries |
| Sensitive-data exposure | Explicit `select` for user-list/create/update responses | DTO allowlists and broader response contract tests |
| XSS / malicious uploads | No rich-text CMS or file upload feature exists yet | Add server/client sanitization and upload validation/scanning with those phases |
| Service abuse | Redis fixed-window counters and request validation | General API limits, queue backpressure and load tests |
| CORS misconfiguration | Exact origin derived from `APP_URL`; `credentials: true` | Set the real web origin in each environment and verify preflight in deployment |

## Operational requirements before production

- Keep `AUTH_SECRET` long, random, private and identical across API replicas. Rotate it through a planned procedure.
- Set `APP_URL` to the exact HTTPS web origin. Keep web and API on the same site (such as sibling subdomains) or proxy API calls through the web origin so the `SameSite=Lax` session cookie is sent. Set `TRUSTED_PROXY_CIDRS` only to actual proxy ranges; do not trust arbitrary forwarded headers.
- Inject `DATABASE_URL`, `REDIS_URL`, email credentials and storage credentials from a secret manager. Do not put production secrets in `.env`, CI logs, images or docs.
- Define SSO/MFA, data retention/deletion, HR privacy, document classification, upload limits, backup encryption, RPO/RTO and incident response with the project owner.
- Run database/Redis integration tests, security review, dependency audit, backup restore drill and staging smoke tests before production approval.

## Local secret handling

Copy `.env.example` to `.env` for local use and replace `AUTH_SECRET` with a locally generated value of at least 32 characters. `LOCAL_ADMIN_PASSWORD` in the example is a known local-only credential; change it before sharing an environment and never use it outside development/test. The supplied email settings are placeholders; no mail delivery adapter is wired yet. Do not commit `.env`.
