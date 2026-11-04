# Phase 1 Report

```text
PHASE: Phase 1 — Foundation
STATUS: Complete
```

## 1. Đã triển khai

- pnpm workspace (pnpm 9.15.5), Next.js 15 web shell tiếng Việt và NestJS API dưới `/api/v1`.
- Prisma schema và migration khởi đầu cho users/profiles, employees, departments, positions, RBAC, sessions, reset tokens và audit logs.
- Session cookie auth, password reset token một lần, session revoke, CSRF guard trên logout và các mutation user/organization, permission guard, user/organization APIs và dashboard API.
- Redis-backed IP throttling cho login/password reset; account lockout theo HMAC của email chuẩn hóa. API fail closed khi Redis không sẵn sàng.
- Credentialed CORS chỉ cho origin `APP_URL`; request ID được trả qua header và response metadata.
- PostgreSQL/Redis readiness check; Docker Compose cho PostgreSQL/Redis và profile MinIO; local seed account có `super_admin` role, scrypt-hash password và guard development/test; CI được cấu hình để migrate database trống và chạy auth integration tests với PostgreSQL/Redis service containers.
- Tài liệu API, database, security, deployment và runbook mô tả rõ trạng thái hiện có.

## 2. Kiểm thử đã chạy

Kết quả sau cập nhật CORS/CSRF/request-ID interceptor và tài liệu:

| Command | Result |
|---|---|
| `corepack pnpm -r lint` | PASS |
| `corepack pnpm -r typecheck` | PASS |
| `pnpm -r test` | PASS; 40 API tests across 16 suites |
| `corepack pnpm -r build` | PASS; API + static web export |
| `corepack pnpm db:generate` | PASS; Prisma Client 6.19.3 |
| `corepack pnpm audit --prod` | PASS; no known vulnerabilities |
| Empty-database PostgreSQL migrations | PASS in GitHub Actions run [41822335893](https://github.com/pabotido/pabotido.github.io/actions/runs/41822335893); local migration deployment also applied CMS migration 0002 |
| `pnpm --filter @portal/api test:integration` | PASS locally; 3 suites / 5 tests with PostgreSQL and Redis, including whole-app bootstrap |
| API runtime smoke | PASS; app startup, readiness, local admin login, CSRF-protected draft create and submit; temporary data removed |
| Local Compose and seed | PASS; PostgreSQL/Redis started, local-only seed ran without changing `.env` |
| Hosted CI migration/integration gate | PASS; lint, typecheck, unit tests, migration, integration tests, build and production dependency audit succeeded |
| Docker image build | NOT RUN; container image build is not required for Phase 1 local acceptance |

## 3. Chưa hoàn thành

- Local Docker Compose startup and seed admin login were verified. The sample credential is local-only; change it before sharing an environment.
- GitHub Pages chỉ phục vụ static export; chưa có API runtime nên login/dashboard không hoạt động trên site production.
- CMS remains partial; document storage, approvals, tasks/projects, HR workflows, notifications and global search are still future phases.
- Chưa có production hosting, secret manager, backup/restore drill, monitoring/alerts, staging hoặc rollback pipeline.
- Cần owner xác nhận SSO/MFA, retention/privacy, file limits, RPO/RTO, organization model và production email/runtime.

## 4. Cách chạy local

Xem [README](README.md), [Deployment](docs/DEPLOYMENT.md) và [Runbook](docs/RUNBOOK.md). Local setup cần Node 20.6+, pnpm 9.15.5 và Docker daemon đang chạy. `.env.example` chứa giá trị local-only cùng placeholder, không dùng cho staging/production.

## 5. Rủi ro và giới hạn

- Email reset token chưa được gửi qua provider; development response tạm trả token để local flow có thể tích hợp.
- MinIO chưa nối vào storage adapter.
- Web test script còn placeholder; chưa có browser E2E.
- Static Pages workflow vẫn deploy export; không dùng nó làm bằng chứng API/portal đã được triển khai.

## 6. Skills & tools

- Skills applied across this phase: `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation`, `security-and-hardening`, `api-and-interface-design`, `documentation-and-adrs`, `verification-before-completion`, `git-workflow-and-versioning`.
- Tools used: repository inspection, pnpm/Corepack, Jest, ESLint, TypeScript, Nest/Next builds, Prisma generation, dependency audit and Git.
- Docker Desktop Compose services were started for local migration and integration verification; hosted GitHub Actions provides the repeatable CI environment.
