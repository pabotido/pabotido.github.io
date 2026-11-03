# Phase 1 Report

```text
PHASE: Phase 1 — Foundation
STATUS: Partial
```

## 1. Đã triển khai

- Dashboard API được bảo vệ bằng session và lấy active employees, departments, user profile và audit activity từ PostgreSQL.
- Web login gọi API thật; dashboard có loading, error và empty states. Dữ liệu chưa có module được hiển thị là chưa triển khai thay vì số liệu giả.
- Static export/GitHub Pages deployment đã được gỡ vì không tương thích với secure cookie session và API runtime.

- pnpm workspace với phiên bản `9.15.5`, lockfile và cấu trúc apps/packages.
- Next.js 15 App Router web shell tiếng Việt.
- NestJS API với prefix `/api/v1`, Helmet, cookie parser, ValidationPipe và Swagger.
- Health endpoints: `/api/v1/health`, `/api/v1/health/live`, `/api/v1/health/ready`.
- Prisma schema nền tảng cho users, profiles, employees, departments, positions, roles, permissions, sessions, reset tokens và audit logs.
- Seed local có chặn `NODE_ENV=production`.
- Docker Compose định nghĩa PostgreSQL, Redis và MinIO storage profile; PostgreSQL/Redis có healthcheck.
- ESLint 9 flat config, TypeScript strict, CI workflow và API tests.
- Secure-cookie session authentication, CSRF logout, password reset token flow và server-side RBAC.
- Users, departments và employees API với validation, permissions và object-level self-access check.
- Request ID middleware và chuẩn lỗi API thống nhất.

## 2. Kiểm thử đã chạy

| Command | Result |
|---|---|
| `npx --yes pnpm@9.15.5 install` | PASS; lockfile generated |
| `npx --yes pnpm@9.15.5 db:generate` | PASS |
| `npx --yes pnpm@9.15.5 lint` | PASS |
| `npx --yes pnpm@9.15.5 typecheck` | PASS |
| `npx --yes pnpm@9.15.5 test` | PASS; auth/RBAC/password-reset/request-id tests |
| `npx --yes pnpm@9.15.5 build` | PASS; API and web |
| `docker compose ps` | NOT RUN; Docker CLI unavailable in this environment |
| `prisma migrate deploy` | NOT RUN; requires PostgreSQL/Docker |
| `pnpm db:seed` | NOT RUN; requires PostgreSQL |
| `npx --yes pnpm@9.15.5 --filter @portal/api test -- --runInBand` | PASS; 11 tests |
| `npx --yes pnpm@9.15.5 --filter @portal/api build` | PASS |
| `npx --yes pnpm@9.15.5 --filter @portal/web build` | PASS |
| API runtime wiring | PASS; Nest application started and routes mapped |

## 3. Chưa hoàn thành

- Chưa có UI test/E2E test cho login và dashboard; web test script hiện chỉ là placeholder.
- Chưa có production runtime để deploy Next.js và API cùng secure HTTPS domain.

- Chạy integration tests đầy đủ với PostgreSQL thật và thêm test cases cho users/organization.
- Redis-backed rate limiting và login lockout controls.
- Hoàn thiện MinIO storage integration/bucket bootstrap.
- Deployment/runbook hoàn chỉnh và quyết định production về SSO/MFA, email, retention, backup/RPO/RTO.

## 4. Cách chạy hiện tại

```powershell
npx --yes pnpm@9.15.5 install
Copy-Item .env.example .env
npx --yes pnpm@9.15.5 db:generate
docker compose up -d postgres redis
# Optional: docker compose --profile storage up -d minio
npx --yes pnpm@9.15.5 exec prisma migrate deploy --schema database/schema.prisma
npx --yes pnpm@9.15.5 dev
```

## 5. Skills & tools

- Skills discovered: chỉ có `skill-creator`, không liên quan trực tiếp đến Next.js/NestJS/Prisma.
- Tools used: filesystem inspection, Git checks, pnpm, TypeScript, ESLint, Jest, Next build, Nest build, Prisma CLI.
- Docker CLI/Compose không có trong môi trường kiểm tra hiện tại, nên PostgreSQL/Redis migration và integration chưa chạy được.

## 6. Rủi ro

- Chưa có Redis-backed rate limiting/lockout nên authentication chưa production-ready.
- MinIO image/registry cần được pull thành công trước khi kiểm thử upload/storage.
- Cảnh báo Next.js ESLint plugin xuất hiện trong build, nhưng không chặn build/test hiện tại.
