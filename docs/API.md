# API Reference

## Base URL and conventions

The NestJS API uses the `/api/v1` prefix by default. Set `API_PREFIX` to change it. Swagger UI is served at `/docs` (outside the API prefix) when the API is running.

Successful responses use `{ "data": ..., "meta": { "requestId": "..." } }`. Errors use `{ "error": { "code": "...", "message": "...", "details": [] }, "meta": { "requestId": "..." } }`. The API accepts an optional `X-Request-Id`; otherwise it generates a UUID and returns it in the `X-Request-Id` response header and response metadata. Clients should not put credentials or secrets in request IDs.

All bodies pass through Nest's `ValidationPipe` with unknown properties rejected. Cookie-authenticated calls must send credentials. Mutating authenticated requests must also send the CSRF token from the login response in `X-CSRF-Token`; the API sets the matching `portal_csrf` cookie. Browser access is limited to the exact `APP_URL` origin and includes credentials.

## Current endpoint catalog

All paths below are relative to `/api/v1`.

| Method | Path | Auth / permission | Purpose |
|---|---|---|---|
| GET | `/health` | Public | API status and timestamp |
| GET | `/health/live` | Public | Process liveness |
| GET | `/health/ready` | Public | Checks PostgreSQL and Redis; returns 503 if either dependency is unavailable |
| POST | `/auth/login` | Public; 10 requests per IP per 15 minutes | Create a session; returns user data and a CSRF token, and sets session/CSRF cookies |
| POST | `/auth/password-reset/request` | Public; 5 requests per IP per 15 minutes | Start reset flow; response does not reveal whether the account exists |
| POST | `/auth/password-reset/confirm` | Public; one-time token required | Set a new password and revoke active sessions |
| GET | `/auth/me` | Session | Current user and permissions |
| POST | `/auth/logout` | Session + CSRF token | Revoke current session |
| GET | `/auth/permissions-check` | Session + `roles.manage` | Example protected permission check |
| GET | `/dashboard` | Session | Current user's foundation dashboard data |
| GET | `/users?page=&pageSize=` | Session + `users.read` | Paginated user list; page size is capped at 100 |
| GET | `/users/:id` | Session; self or `users.read` | Read a user profile |
| POST | `/users` | Session + `users.create` + CSRF | Create a user and profile |
| PATCH | `/users/:id` | Session; self or `users.update` + CSRF | Update allowed user fields |
| GET | `/departments` | Session + `departments.read` | List departments |
| POST | `/departments` | Session + `departments.manage` + CSRF | Create a department |
| PATCH | `/departments/:id` | Session + `departments.manage` + CSRF | Update a department |
| GET | `/employees` | Session + `employees.read` | List employees |
| POST | `/employees` | Session + `employees.create` + CSRF | Create an employee record |
| GET | `/news?q=&category=&tag=&page=&pageSize=` | Session | Search/filter/paginate published company and department news visible to the current employee |
| GET | `/news/categories` | Session | List public category filters |
| GET | `/news/tags` | Session | List public tag filters |
| GET | `/news/:slug` | Session | Read a published article visible to the current employee; other audiences return 404 |
| GET | `/cms/articles` | Session + `cms.news.read` | List managed articles across editorial states |
| GET | `/cms/departments` | Session + `cms.news.create` | List departments for audience targeting |
| GET | `/cms/categories`, `/cms/tags` | Session + `cms.news.read` | List taxonomy for CMS management |
| POST | `/cms/categories`, `/cms/tags` | Session + `cms.taxonomy.manage` + CSRF | Create a category or tag |
| POST | `/cms/articles` | Session + `cms.news.create` + CSRF | Create a draft article |
| PATCH | `/cms/articles/:id` | Session + `cms.news.update` + CSRF | Update a draft article |
| POST | `/cms/articles/:id/submit` | Session + `cms.news.update` + CSRF | Submit a draft for review |
| POST | `/cms/articles/:id/approve` | Session + `cms.news.approve` + CSRF | Approve a pending article; authors cannot approve their own |
| POST | `/cms/articles/:id/publish` | Session + `cms.news.publish` + CSRF | Publish an approved article immediately |

Other CMS capabilities (categories/tags, rich text/media, scheduled publication, revision history, search and full admin editing) and document, workflow, project/task, leave-management, notification, search and audit-management endpoints are not implemented yet.

## Authentication and error codes

- Login creates a random opaque session token. Only its SHA-256 hash is stored in PostgreSQL; the raw token is sent in an HttpOnly cookie. The CSRF token is not an authentication credential; the web client keeps it in per-tab `sessionStorage` so it can send the matching request header.
- Password reset tokens are random, stored as hashes, expire after 30 minutes, and are consumed once. Email delivery is not wired yet. In development only, the request endpoint includes a `developmentToken`; production responses omit it.
- After five failed password checks for an email, login is blocked for the remainder of the 15-minute counter window. The account counter and IP rate limits use Redis shared state. Redis errors fail closed.
- Error codes include `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `TOO_MANY_REQUESTS`, `SERVICE_UNAVAILABLE`, and `INTERNAL_ERROR`.

## Browser configuration

Set `APP_URL` to one HTTP(S) origin without a path, for example `https://portal.example.com`. Credentialed CORS accepts only this origin. A frontend deployed at another origin requires an explicit configuration change and redeployment. `TRUSTED_PROXY_CIDRS` should list only the actual reverse-proxy CIDRs; leave it empty for direct local access.

## OpenAPI

Swagger is generated from Nest route and DTO metadata at `/docs`. The endpoint table above is a concise operational index; the running OpenAPI document is authoritative for schemas and route metadata.
