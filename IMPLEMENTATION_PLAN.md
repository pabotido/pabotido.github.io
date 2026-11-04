# Implementation Plan

## Current phase: Phase 2 — Enterprise Portal & CMS (partial; news editorial workflow slice)

### Repository baseline
- Existing repository is a pnpm workspace containing `apps/web` (Next.js), `apps/api` (NestJS), Prisma schema, CI and Docker Compose.
- The initial dashboard was a static prototype; it has now been replaced with a session-protected API-backed dashboard for the foundation data that exists.
- The current GitHub Pages workflow still builds a static export; it cannot host authenticated portal flows. A production runtime remains unresolved.
- Target product language: Vietnamese; default locale `vi-VN`; timezone `Asia/Ho_Chi_Minh`.

### Delivery phases

- [x] Phase 0 — repository discovery, architecture, assumptions, initial ERD, threat model.
- [x] Phase 1 — foundation: workspace, web/API shells, PostgreSQL/Prisma, Redis, auth, RBAC, users/employees/departments, health, Swagger, logging, CI.
- [ ] Phase 2 — portal and CMS.
- [ ] Phase 3 — document management and object storage.
- [ ] Phase 4 — workflow and approvals.
- [ ] Phase 5 — projects and tasks.
- [ ] Phase 6 — HR capabilities and import/export.
- [ ] Phase 7 — production hardening, observability, CI/CD, backup/restore and cloud deployment design.

## Phase 1 implementation checklist

- [x] Add root `package.json`, pinned Node/pnpm version and workspace scaffold.
- [x] Add Next.js web application with Vietnamese app shell.
- [x] Add authenticated dashboard API and frontend loading/error/empty states.
- [x] Replace hard-coded dashboard data with authenticated API data; static Pages export remains unsuitable for authenticated portal flows.
- [x] Add NestJS API with `/api/v1`, validation, Swagger and health endpoints.
- [x] Make readiness check PostgreSQL and Redis dependencies.
- [x] Add initial Prisma schema for identity, access control and organization foundations.
- [x] Add secure session/auth flow, password reset token flow and RBAC permission guard.
- [x] Restrict credentialed CORS to `APP_URL`, protect authenticated mutations with CSRF, and return request IDs consistently.
- [x] Add Redis-backed rate limiting and lockout controls for authentication endpoints.
- [x] Add local-only admin seed with development/test guard and environment-provided credentials.
- [x] Add PostgreSQL, Redis and optional MinIO Compose services with health checks.
- [x] Generate the Prisma client.
- [x] Run database migration validation from an empty PostgreSQL database (GitHub Actions run 41819897433, commit `d7835b3`).
- [x] Add shared ESLint 9 flat config and pass lint.
- [x] Add unit test setup and auth/RBAC/password-reset tests.
- [x] Run integration tests against PostgreSQL/Redis (GitHub Actions run 41819897433, commit `d7835b3`).
- [x] Add CI checks for install, lint, typecheck, test and build.
- [x] Configure CI PostgreSQL/Redis services, clean-database migration and auth integration-test gates.
- [x] Update README and phase documentation after verification.
- [x] Add API, database, security, deployment and local operations documentation.

## Phase 2 implementation checklist

- [x] Add CMS article schema and additive migration for editorial status and company/department audience.
- [x] Add permission-protected API for draft creation/editing, review submission, approval and publication.
- [x] Prevent authors from approving their own articles; enforce state transitions atomically and audit them.
- [x] Restrict published feeds and article detail to company or the employee's department audience.
- [x] Add Vietnamese reader and content workflow pages backed by the API.
- [x] Add shared categories/tags, article assignment and reader filters.
- [x] Add server-side search and pagination to the published news feed.
- [x] Run CMS migration and PostgreSQL integration suite in hosted CI (run 41822335893).
- [ ] Validate taxonomy migration and filtered feed in hosted CI.
- [ ] Add rich text editor and server-side HTML sanitization.
- [ ] Add media library, scheduling, revisions/history, search, pagination and CMS E2E workflow.

## Dependencies and gates

1. Environment must provide Node, pnpm (or an approved equivalent), and Docker for full local validation.
2. Phase 1 schema and auth decisions must be stable before CMS and document modules depend on them.
3. Each phase requires migration, server validation, authorization, tests, documentation and real command results before being marked complete.

## Phase 1 status: Complete

Foundation code, local PostgreSQL/Redis Compose startup, both migrations, guarded local admin seed/login, API bootstrap and readiness, auth/CMS permissioned API flows, lint, typecheck, unit/integration tests, build and dependency audit have been verified locally and in hosted CI.

Production hosting, SSO/MFA policy, email provider, retention, file limits, RPO/RTO and organization model remain Phase 7 decisions; they do not block the local foundation.

## Current blockers

- Production policies (SSO, email provider, retention, file limits, RPO/RTO and organization model) require owner confirmation before production deployment.

## Phase 2 status: Partial

CMS currently supports article draft/review/approval/publication, company/department audiences, shared categories/tags, search, filtering and pagination. Rich text, media, scheduling, history, additional content types and end-to-end browser validation remain.
