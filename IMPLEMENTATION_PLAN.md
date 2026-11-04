# Implementation Plan

## Current phase: Phase 1 — Foundation (partial; dashboard now uses real API data)

### Repository baseline
- Existing repository is a pnpm workspace containing `apps/web` (Next.js), `apps/api` (NestJS), Prisma schema, CI and Docker Compose.
- The initial dashboard was a static prototype; it has now been replaced with a session-protected API-backed dashboard for the foundation data that exists.
- The current GitHub Pages workflow still builds a static export; it cannot host authenticated portal flows. A production runtime remains unresolved.
- Target product language: Vietnamese; default locale `vi-VN`; timezone `Asia/Ho_Chi_Minh`.

### Delivery phases

- [x] Phase 0 — repository discovery, architecture, assumptions, initial ERD, threat model.
- [ ] Phase 1 — foundation: workspace, web/API shells, PostgreSQL/Prisma, Redis, auth, RBAC, users/employees/departments, health, Swagger, logging, CI.
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
- [ ] Run database migration validation from an empty PostgreSQL database.
- [x] Add shared ESLint 9 flat config and pass lint.
- [x] Add unit test setup and auth/RBAC/password-reset tests.
- [ ] Run integration tests against PostgreSQL.
- [x] Add CI checks for install, lint, typecheck, test and build.
- [x] Configure CI PostgreSQL/Redis services, clean-database migration and auth integration-test gates.
- [x] Update README and phase documentation after verification.
- [x] Add API, database, security, deployment and local operations documentation.

## Dependencies and gates

1. Environment must provide Node, pnpm (or an approved equivalent), and Docker for full local validation.
2. Phase 1 schema and auth decisions must be stable before CMS and document modules depend on them.
3. Each phase requires migration, server validation, authorization, tests, documentation and real command results before being marked complete.

## Phase 1 status: Partial

Foundation code, workspace, web shell, API health/Swagger/readiness, Prisma schema, Compose definition, local admin seed, Redis-backed authentication limits, CORS/CSRF protections, lint, typecheck, unit tests, build and Prisma client generation are implemented and verified.

Remaining before Phase 1 can be Complete:
- [ ] Run migration and integration tests against PostgreSQL.
- [ ] Confirm the new PostgreSQL/Redis CI integration gate passes on GitHub.
- [x] Document current local deployment and operations; production deployment remains unresolved.
- [ ] Confirm production policies (SSO/MFA, email, retention, file limits, RPO/RTO, organization model) and choose an approved runtime before production deployment.

## Current blockers

- Docker CLI/Compose is installed, but the Docker daemon is not running, so database/Redis integration cannot be executed locally yet.
- Production policies (SSO, email provider, retention, file limits, RPO/RTO and organization model) require owner confirmation before production deployment.
