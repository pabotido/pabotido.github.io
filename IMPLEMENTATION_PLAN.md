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

- [ ] Add root `package.json`, pinned Node/pnpm versions and lockfile.
- [ ] Add Next.js web application with Vietnamese app shell and typed API client boundary.
- [ ] Add NestJS API with `/api/v1`, request ID, validation, structured errors and Swagger.
- [ ] Add Prisma schema and migration for identity, access control and organization foundations.
- [ ] Add secure session/auth flow, password reset token flow, rate limiting and RBAC permission guard.
- [ ] Add local-only seed with explicit development guard.
- [ ] Add PostgreSQL, Redis and optional MinIO Compose services with health checks.
- [ ] Add unit/integration test setup and initial auth/RBAC tests.
- [ ] Add CI checks for install, lint, typecheck, test and build.
- [ ] Update README and phase documentation after verification.

## Dependencies and gates

1. Environment must provide Node, pnpm (or an approved equivalent), and Docker for full local validation.
2. Phase 1 schema and auth decisions must be stable before CMS and document modules depend on them.
3. Each phase requires migration, server validation, authorization, tests, documentation and real command results before being marked complete.

## Current blockers

- `pnpm` is not available and Corepack cannot write to the system Node installation without elevated permissions.
- Docker CLI/Compose is not installed, so database/container integration cannot be executed locally yet.
- Production policies (SSO, email provider, retention, file limits, RPO/RTO and organization model) require owner confirmation before production deployment.
