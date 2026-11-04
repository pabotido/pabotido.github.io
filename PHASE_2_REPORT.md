# Phase 2 Report — Initial CMS News Slice

```text
PHASE: Phase 2 — Enterprise Portal & CMS
STATUS: Partial
```

## 1. Đã triển khai

- Bài viết nội bộ với trạng thái bản nháp, chờ duyệt, đã duyệt, đã xuất bản và lưu trữ.
- Quy trình draft → review → approval → publication; tác giả không thể tự duyệt; cập nhật trạng thái có điều kiện để tránh ghi đè race; tạo bài và workflow audit được ghi trong cùng transaction.
- Audience toàn công ty hoặc một phòng ban. Feed và trang chi tiết chỉ trả bài published đúng audience; bài ngoài quyền trả 404.
- API CRUD phần nền, Vietnamese UI đọc tin và quản lý quy trình, có loading/error/empty states.

## 2. File/module chính

- `database/schema.prisma`, `database/migrations/0002_cms_articles/migration.sql`
- `apps/api/src/cms/` và `apps/api/test/cms.service.spec.ts`
- `apps/api/test/integration/cms.integration.spec.ts`
- `apps/web/app/news/page.tsx`, `apps/web/app/admin/cms/news/page.tsx`
- `apps/web/lib/api.ts`, `apps/web/components/portal/portal-shell.tsx`
- `docs/API.md`, `docs/DATABASE.md`, `IMPLEMENTATION_PLAN.md`, `README.md`

## 3. Database

- Migration: `0002_cms_articles`, additive schema; clean-database migration passed in hosted CI run 41822335893.
- Seed: adds CMS permissions to local `super_admin` seed.
- Schema: article content, slug, author, editorial state, audience, optional department and published timestamp.

## 4. API/UI

- API endpoints are listed in `docs/API.md`.
- Reader: `/news`; query string `?article=<slug>` opens an article for compatibility with current static export.
- CMS admin: `/admin/cms/news`.
- Rich-text HTML is not accepted/rendered; this slice uses plain text to avoid unsafe HTML rendering.

## 5. Checks run

- API unit tests: PASS, 40 tests across 16 suites.
- Workspace lint: PASS.
- Workspace typecheck: PASS.
- API and web builds: PASS; Next static export includes `/news` and `/admin/cms/news`.
- CMS PostgreSQL integration: PASS in hosted CI run [41822335893](https://github.com/pabotido/pabotido.github.io/actions/runs/41822335893), including audience isolation and state workflow.
- Production dependency audit: PASS locally and in hosted CI; no known vulnerabilities found.
- Browser E2E/accessibility inspection: NOT RUN; this environment has no Chrome DevTools MCP, Playwright CLI, or local Playwright package installed.

## 6. Local use

Apply migrations and seed with the local-only setup in `README.md`, then run web and API. Sign in as the local super admin, create a draft at `/admin/cms/news`, submit it, approve it and publish it. Read published company/department news at `/news`.

## 7. Chưa làm / giới hạn

- Categories, tags, banners, rich-text editor, server HTML sanitization, media library, scheduled publication, revision history, search, pagination and browser E2E.
- GitHub Pages is still a static export; the authenticated API flows need a separate supported application runtime.

## 8. Skills & tools

- Skills read/applied: `using-agent-skills`, `brainstorming`, `incremental-implementation`, `api-and-interface-design`, `frontend-ui-engineering`, `git-workflow-and-versioning`, `ci-cd-and-automation`, `verification-before-completion`.
- Tools: Prisma generation, Jest, ESLint, TypeScript, Nest build, Next build, GitHub Actions public status API.
