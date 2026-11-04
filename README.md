# Enterprise Corporate Portal

Cổng thông tin và cộng tác nội bộ doanh nghiệp, triển khai theo tài liệu yêu cầu tại `PROJECT_SPEC_ENTERPRISE_CORPORATE_PORTAL.md`.

## Trạng thái

Đang ở **Phase 2 — Enterprise Portal & CMS** (Partial). Nền tảng authentication, RBAC, users, departments, employees và dashboard API đã có. CMS hiện hỗ trợ bài viết bản nháp → gửi duyệt → duyệt → xuất bản, audience công ty/phòng ban, categories/tags, tìm kiếm/lọc/phân trang và trang quản lý. Migration taxonomy đã qua local integration; hosted CI run mới đang chờ. Rich text/media, lịch xuất bản, lịch sử phiên bản và các module documents, approvals, tasks, notifications, HR vẫn chưa hoàn thành.

Workflow GitHub Pages hiện tạo bản xuất tĩnh, chỉ phù hợp để phục vụ giao diện public. Xác thực bằng cookie và portal gọi API cần runtime Next.js/API có HTTPS, PostgreSQL và Redis. Production cũng cần object storage khi tính năng upload tài liệu được triển khai.

Khi API chạy sau reverse proxy, đặt `TRUSTED_PROXY_CIDRS` thành các CIDR proxy tin cậy để giới hạn theo đúng IP client; để trống khi API nhận kết nối trực tiếp. `APP_URL` phải khớp origin web; web và API production cần cùng site (hoặc API đi qua same-origin proxy) để session cookie `SameSite=Lax` hoạt động.

## Tài liệu

- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Architecture](ARCHITECTURE.md)
- [Decisions](DECISIONS.md)
- [API conventions](docs/API.md)
- [Database design](docs/DATABASE.md)
- [Security baseline](docs/SECURITY.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Operations runbook](docs/RUNBOOK.md)

## Chạy local

Yêu cầu Node.js 20.6+ và Docker Desktop. Nếu Corepack không có quyền hệ thống, dùng pnpm tạm thời:

```powershell
npx --yes pnpm@9.15.5 install
Copy-Item .env.example .env
npx --yes pnpm@9.15.5 db:generate
docker compose up -d postgres redis
# Optional storage service when the MinIO registry is available:
# docker compose --profile storage up -d minio
npx --yes pnpm@9.15.5 exec prisma migrate deploy --schema database/schema.prisma
npx --yes pnpm@9.15.5 db:seed
npx --yes pnpm@9.15.5 dev
```

- Web: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- API health: `http://localhost:4000/api/v1/health`
- Dashboard API: `http://localhost:4000/api/v1/dashboard` (cần session cookie)
- Swagger: `http://localhost:4000/docs`

Local seed tạo tài khoản `admin@company.local` từ `LOCAL_ADMIN_PASSWORD` trong `.env`; mật khẩu mẫu `ChangeMe123!` chỉ dành cho local, hãy đổi trước khi chia sẻ môi trường và không dùng ở staging/production. Seed bị từ chối nếu `NODE_ENV` khác `development`/`test` hoặc `DATABASE_URL` không trỏ về loopback.

Phase 1 foundation đã được xác minh: PostgreSQL/Redis Compose, migration database trống, local admin seed/login, API bootstrap/readiness, auth integration và quality gates. Login throttling dùng Redis; CORS giới hạn theo `APP_URL`; route ghi dữ liệu cần CSRF token. CMS tin tức đang ở Phase 2 (Partial).

CMS: mở `http://localhost:3000/news` để đọc tin và `http://localhost:3000/admin/cms/news` để quản lý bài theo quyền tài khoản.
