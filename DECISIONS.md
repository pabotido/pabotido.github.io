# Architecture Decisions

## ADR-0001 — Start as a modular monolith

- **Status:** Accepted for Phase 0.
- **Decision:** Use one NestJS API with explicit domain module boundaries and one Next.js application.
- **Reason:** The project is new and has no measured scale requiring microservices. A modular monolith reduces deployment and debugging complexity while preserving extraction seams.
- **Consequence:** Module ownership and dependency direction must be enforced in review.

## ADR-0002 — Target pnpm workspace

- **Status:** Accepted for Phase 0.
- **Decision:** Use pnpm workspaces with a root workspace and apps/packages layout.
- **Reason:** Matches the supplied specification and keeps shared types/UI/configuration explicit.
- **Consequence:** A pinned package-manager version and lockfile are required before Phase 1 is complete.

## ADR-0003 — Prisma/PostgreSQL for transactional core data

- **Status:** Proposed; confirm during Phase 1 implementation.
- **Decision:** Use Prisma migrations against PostgreSQL.
- **Reason:** Strong TypeScript integration, migration workflow and suitable relational constraints for RBAC, approvals and audit data.
- **Consequence:** Query boundaries and indexes must be reviewed; Prisma does not replace authorization or performance testing.

## ADR-0004 — Secure cookie session as the initial browser auth boundary

- **Status:** Proposed; finalize in Phase 1.
- **Decision:** Prefer an HttpOnly, Secure-in-production, SameSite-configured session strategy over long-lived browser JWT storage.
- **Reason:** Reduces token exposure in the browser and aligns with the security requirements.
- **Consequence:** CSRF protection, session revocation and horizontal-scaling session storage are mandatory.

## ADR-0005 — No production policy invented

- **Status:** Accepted.
- **Decision:** Use safe local/staging assumptions only; do not invent company policy for leave, retention, SSO, email, RPO/RTO or data residency.
- **Reason:** These materially affect legal, security and operational design.
- **Consequence:** These remain owner-confirmation items before production.

## ADR-0006 — Environment limitations are reported honestly

- **Status:** Accepted.
- **Decision:** Do not claim dependency installation, Docker execution or tests passed when the local environment cannot run them.
- **Reason:** The specification requires real command results and forbids false completion claims.
- **Current evidence:** Node.js and pinned pnpm through Corepack are available; Docker CLI/Compose is installed, but the Docker daemon is not running.

## ADR-0007 — Store authentication rate limits in Redis

- **Status:** Accepted for Phase 1.
- **Decision:** Use atomic Redis fixed-window counters for login (10 attempts per IP per 15 minutes) and password-reset requests (5 per IP per 15 minutes). Track failed login attempts by an HMAC-SHA-256 of normalized email, keyed with `AUTH_SECRET`, and block further attempts for the remainder of the 15-minute window after five failures.
- **Reason:** Shared state enforces limits across API replicas without storing raw IP addresses or email addresses in Redis keys.
- **Consequence:** Redis is required for API startup and authentication; if Redis is unavailable, authentication operations fail closed. Behind a reverse proxy, deployments must set `TRUSTED_PROXY_CIDRS` to the actual proxy ranges so per-IP limits use the real client IP safely. Current unit tests mock Redis; integration verification needs a running Redis service.

## ADR-0008 — Restrict credentialed browser access and protect authenticated mutations

- **Status:** Accepted for Phase 1.
- **Decision:** Allow credentialed browser CORS requests only from the exact `APP_URL` origin. Require the double-submit CSRF cookie/header pair for unsafe methods on authenticated user and organization APIs, and on logout.
- **Reason:** Browser session cookies are ambient credentials; broad CORS or unguarded state-changing routes would weaken the session boundary.
- **Consequence:** Deployments must set `APP_URL` to the actual web origin. Future authenticated mutation controllers must attach `CsrfGuard`; the current tests cover the guard and controller wiring. Login/reset CSRF behavior and browser E2E coverage remain to be reviewed.

## ADR-0009 — Restrict the development seed to loopback PostgreSQL

- **Status:** Accepted for Phase 1.
- **Decision:** Permit seed only when `NODE_ENV` is `development` or `test`, and `DATABASE_URL` resolves to a loopback host. Read the local administrator email/password from environment configuration and hash the password before storing it.
- **Reason:** A local convenience seed must not provision a known administrator into staging or production because of a mistaken environment label or remote database URL.
- **Consequence:** Local Compose maps PostgreSQL through loopback. Seed configuration is unit-tested; database writes still need integration verification.
