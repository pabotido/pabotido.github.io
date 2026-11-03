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
- **Current evidence:** Node.js is available; pnpm and Docker are unavailable; Corepack activation failed with EPERM in `C:\Program Files\nodejs`.
