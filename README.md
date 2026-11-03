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

## Môi trường hiện tại

- Node.js `v24.22.1` đã có.
- `pnpm` chưa có; Corepack activation không thực hiện được do quyền hệ thống (`EPERM`).
- Docker/Compose chưa có.

Vì vậy chưa thể chạy install, migration, service integration hoặc test thực tế. Không dùng thông tin này như môi trường staging/production.
