# Deployment Guide

## Supported state

The repository currently supports local development with PostgreSQL and Redis in Docker Compose while the web and API run through the pnpm workspace. `infra/docker/Dockerfile.api` describes an API image, but container build/start has not been verified because the local Docker daemon is unavailable. There is no production web/API runtime configuration, migration release job, secret-manager integration, or staging environment in this repository.

The GitHub Pages workflow deploys `apps/web/out`, a Next.js static export. It can host public static pages. It cannot host the API process, PostgreSQL, Redis, or the cookie-authenticated portal. The current login/dashboard pages require an API and will not provide a working authenticated portal on GitHub Pages by themselves. Do not treat a green Pages deployment as a portal deployment.

## Local development

Prerequisites: Node.js 20.6+, Corepack/pnpm 9.15.5, and Docker Desktop with its daemon running.

```powershell
corepack pnpm install --frozen-lockfile
Copy-Item .env.example .env
# Replace AUTH_SECRET with a random local-only value of at least 32 characters.
corepack pnpm db:generate
docker compose up -d postgres redis
corepack pnpm exec prisma migrate deploy --schema database/schema.prisma
corepack pnpm db:seed
corepack pnpm dev
```

Web listens on `http://localhost:3000`; API listens on `http://localhost:4000`. Swagger is at `http://localhost:4000/docs`. MinIO is optional (`docker compose --profile storage up -d minio`) and is not yet connected to a document module.

## Environment configuration

The API validates `NODE_ENV`, `PORT`, `API_PREFIX`, `AUTH_SECRET`, `REDIS_URL`, `TRUSTED_PROXY_CIDRS`, and `APP_URL` at startup. Keep `.env` local and inject environment-specific values through the deployment platform's secret/config facilities. `APP_URL` must be the exact web HTTP(S) origin without a path; it is the credentialed CORS allowlist. `TRUSTED_PROXY_CIDRS` must contain only actual trusted proxy ranges.

The frontend reads `NEXT_PUBLIC_API_URL` at build time. Set it to the reachable HTTPS API base URL before building the web app; never set it to localhost in a public deployment. The API must allow the deployed web origin through `APP_URL`, and both services must use HTTPS for secure session cookies. Keep web and API on the same site (for example, sibling subdomains) or expose the API through a same-origin reverse proxy; the session cookie uses `SameSite=Lax`.

## Production architecture target (not provisioned)

Before deployment, choose and approve a container runtime, managed PostgreSQL, managed Redis, S3-compatible object storage, TLS/reverse proxy, secrets manager, backups, monitoring and staging environment. Estimate cost and document network boundaries first. Keep PostgreSQL private. Run migrations as a controlled release job before switching API traffic. Do not create cloud resources or incur provider costs from this repository without explicit approval.

Production readiness gates include migration-from-empty verification, PostgreSQL/Redis integration tests, API and web container build/start tests, HTTPS cookie and CORS smoke tests, secret scanning, backup/restore drill, operational alerts, rollback instructions and owner decisions recorded in `DECISIONS.md`.
