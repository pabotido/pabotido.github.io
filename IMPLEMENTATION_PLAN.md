# Implementation Plan

## Current phase: Phase 1 — Foundation (partial; dashboard now uses real API data)

### Repository baseline
- Existing repository is a pnpm workspace containing `apps/web` (Next.js), `apps/api` (NestJS), Prisma schema, CI and Docker Compose.
- The initial dashboard was a static prototype; it has now been replaced with a session-protected API-backed dashboard for the foundation data that exists.
- GitHub Pages deployment was removed because static export cannot provide the required secure session/API runtime.
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
- [x] Remove static export and hard-coded dashboard production data.
- [x] Add NestJS API with `/api/v1`, validation, Swagger and health endpoints.
- [x] Add initial Prisma schema for identity, access control and organization foundations.
- [x] Add secure session/auth flow, password reset token flow and RBAC permission guard.
- [ ] Add Redis-backed rate limiting and lockout controls.
- [x] Add local-only seed with explicit development guard.
- [x] Add PostgreSQL, Redis and optional MinIO Compose services with health checks.
- [ ] Resolve Prisma client generation and run database migration validation.
- [ ] Add shared ESLint 9 flat config and pass lint.
- [x] Add unit test setup and auth/RBAC/password-reset tests.
- [ ] Run integration tests against PostgreSQL.
- [ ] Add CI checks for install, lint, typecheck, test and build.
- [ ] Update README and phase documentation after verification.

## Dependencies and gates

1. Environment must provide Node, pnpm (or an approved equivalent), and Docker for full local validation.
2. Phase 1 schema and auth decisions must be stable before CMS and document modules depend on them.
3. Each phase requires migration, server validation, authorization, tests, documentation and real command results before being marked complete.

## Phase 1 status: Partial

Foundation code, workspace, web shell, API health/Swagger, Prisma schema, Compose definition, local seed guard, lint, typecheck, unit test, build and Prisma client generation are implemented and verified.

Remaining before Phase 1 can be Complete:
- [ ] Run migration and integration tests against PostgreSQL.
- [ ] Redis-backed rate limiting/lockout controls.
- [ ] Complete deployment/runbook documentation and production policy decisions.

## Current blockers

- Docker CLI/Compose is not installed, so database/container integration cannot be executed locally yet.
- Production policies (SSO, email provider, retention, file limits, RPO/RTO and organization model) require owner confirmation before production deployment.
