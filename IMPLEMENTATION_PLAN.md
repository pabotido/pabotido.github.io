# Implementation Plan

## Current phase: Phase 0 — Discovery & Architecture

### Repository baseline
- Existing repository: GitHub Pages shell only (`README.md`, `CNAME`).
- No application source, package manifest, lockfile, database schema, CI workflow, or container configuration exists.
- Existing custom domain file is preserved.
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
- [x] Add NestJS API with `/api/v1`, validation, Swagger and health endpoints.
- [x] Add initial Prisma schema for identity, access control and organization foundations.
- [ ] Add secure session/auth flow, password reset token flow, rate limiting and RBAC permission guard.
- [x] Add local-only seed with explicit development guard.
- [x] Add PostgreSQL, Redis and optional MinIO Compose services with health checks.
- [ ] Resolve Prisma client generation and run database migration validation.
- [ ] Add shared ESLint 9 flat config and pass lint.
- [ ] Add unit/integration test setup and initial auth/RBAC tests.
- [ ] Add CI checks for install, lint, typecheck, test and build.
- [ ] Update README and phase documentation after verification.

## Dependencies and gates

1. Environment must provide Node, pnpm (or an approved equivalent), and Docker for full local validation.
2. Phase 1 schema and auth decisions must be stable before CMS and document modules depend on them.
3. Each phase requires migration, server validation, authorization, tests, documentation and real command results before being marked complete.

## Phase 1 status: Partial

Foundation code, workspace, web shell, API health/Swagger, Prisma schema, Compose definition, local seed guard, lint, typecheck, unit test, build and Prisma client generation are implemented and verified.

Remaining before Phase 1 can be Complete:
- [ ] Secure session authentication and password reset flow.
- [ ] Server-side permission guard and object/data-scope checks.
- [ ] Users/employees/departments API and tests.
- [ ] Run migration and integration tests against PostgreSQL.
- [ ] CI workflow and complete deployment/runbook documentation.

## Current blockers

- Docker CLI/Compose is not installed, so database/container integration cannot be executed locally yet.
- Production policies (SSO, email provider, retention, file limits, RPO/RTO and organization model) require owner confirmation before production deployment.
