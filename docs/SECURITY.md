# Security Baseline and Threat Model

## Baseline

- Deny by default; backend permission and object-level checks are authoritative.
- Hash passwords with Argon2id or appropriately configured bcrypt; never return hashes.
- Use secure HttpOnly sessions, CSRF protection, login throttling, lockout controls and one-time expiring reset tokens.
- Validate every input at the API boundary; allowlist filters/sorts; use ORM parameterization.
- Sanitize rich text server-side and client-side before rendering.
- Validate upload MIME, extension, size and storage key; prevent path traversal; scan when infrastructure supports it.
- Do not log passwords, tokens, secrets, raw sensitive documents or unnecessary personal data.
- Add request IDs, structured logs, audit events and security headers.

## Initial threats and mitigations

| Threat | Mitigation | Verification |
|---|---|---|
| Credential stuffing | Throttling, lockout policy, secure password hashing, optional MFA for admins | Auth integration/security tests |
| Session theft/replay | HttpOnly cookie, TLS, rotation/revocation, SameSite and CSRF controls | Cookie and revocation tests |
| IDOR/BOLA | Object-level permission and data-scope checks on every read/write/download | Cross-user and cross-department E2E tests |
| XSS via CMS | Server/client sanitization and safe rendering | Sanitization unit tests |
| Malicious upload | MIME/size validation, non-user-controlled storage keys, scanning adapter | Upload security tests |
| SQL injection | Prisma/parameterized queries and allowlists | Integration tests and dependency scan |
| Sensitive-data leakage | DTO response allowlists, audit review, redacted logs | API contract/security review |
| Privilege escalation | Permission-based guards, no frontend-only authorization, audited role changes | RBAC matrix tests |
| Availability abuse | Rate limits, bounded retries, queue backpressure and health checks | Load/operational tests |

Production review must additionally confirm SSO/MFA policy, data retention, privacy/legal requirements, backup encryption, incident response and secret management.
