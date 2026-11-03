# Enterprise Corporate Portal

Cổng thông tin và cộng tác nội bộ doanh nghiệp, triển khai theo tài liệu yêu cầu tại `PROJECT_SPEC_ENTERPRISE_CORPORATE_PORTAL.md`.

## Trạng thái

Đang ở **Phase 0 — Discovery & Architecture**. Repository ban đầu chỉ có GitHub Pages shell; chưa có tính năng production nào được tuyên bố hoàn thành.

## Tài liệu

- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Architecture](ARCHITECTURE.md)
- [Decisions](DECISIONS.md)
- [API conventions](docs/API.md)
- [Database design](docs/DATABASE.md)
- [Security baseline](docs/SECURITY.md)

## Chạy local

Yêu cầu Node.js 20+ và Docker Desktop. Nếu Corepack không có quyền hệ thống, dùng pnpm tạm thời:

```powershell
npx --yes pnpm@9.15.5 install
Copy-Item .env.example .env
npx --yes pnpm@9.15.5 db:generate
docker compose up -d postgres redis minio
npx --yes pnpm@9.15.5 db:migrate
npx --yes pnpm@9.15.5 dev
```

- Web: `http://localhost:3000`
- API health: `http://localhost:4000/api/v1/health`
- Swagger: `http://localhost:4000/docs`

Phase 1 hiện đã có web/API foundation, health endpoint, Prisma schema, session authentication, password reset, RBAC guard, users và organization APIs. Migration/integration cần PostgreSQL thật; rate limiting cần Redis adapter trước khi đánh dấu Phase 1 hoàn tất.
