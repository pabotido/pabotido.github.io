# Operations Runbook

This runbook covers local development operations. It is not a production operations plan: production hosting, retention, RPO/RTO, backup encryption and incident ownership have not been selected.

## Start and stop local services

From the repository root:

```powershell
docker compose up -d postgres redis
docker compose ps
corepack pnpm dev
```

Stop the application with Ctrl+C. Stop containers with `docker compose stop`. To remove local containers while retaining named volumes, use `docker compose down`. Removing volumes deletes local database/cache data and must be an intentional developer action.

Optional MinIO is configured under the `storage` Compose profile. The application has no storage adapter yet, so starting MinIO does not enable uploads.

## Health checks

- API liveness: `GET /api/v1/health/live` (process-only check).
- API readiness: `GET /api/v1/health/ready` checks PostgreSQL and Redis and returns 503 when either dependency is unavailable.
- API diagnostic: `GET /api/v1/health`.
- PostgreSQL and Redis container health: `docker compose ps`.

## Database migration and local seed

After starting PostgreSQL and setting `.env`:

```powershell
corepack pnpm db:generate
corepack pnpm exec prisma migrate deploy --schema database/schema.prisma
corepack pnpm db:seed
```

The seed is local/test-only and refuses any `NODE_ENV` other than `development` or `test`, or a `DATABASE_URL` host other than loopback. It creates permission rows, a `super_admin` role and an administrator account from `.env`. The example local password is documented in `README.md`; replace it before sharing the environment.

The empty-database migration procedure has not yet been run in this environment. Validate it against a disposable database before treating it as operationally proven.

## Local backup and restore exercise

The following example writes a custom-format PostgreSQL dump. Keep the output directory private and outside Git; these backups contain personal and authentication data.

```powershell
New-Item -ItemType Directory -Force .local-backups | Out-Null
cmd /c "docker compose exec -T postgres pg_dump -U portal -d enterprise_portal -Fc > .local-backups\enterprise_portal.dump"
```

For a restore exercise, use a disposable database and a separately named target. Create it first, then restore:

```powershell
docker compose exec -T postgres createdb -U portal enterprise_portal_restore_test
cmd /c "docker compose exec -T postgres pg_restore -U portal -d enterprise_portal_restore_test --no-owner < .local-backups\enterprise_portal.dump"
```

These commands are examples only and have not been executed here. Verify a dump with `pg_restore --list` before relying on it. Do not restore over the active local or production database as a first test.

Production backup schedule, encryption, retention and restore objectives require owner approval. No production backup is configured by this repository.

## Redis behavior

Redis stores short-lived authentication rate-limit counters and failed-login counters. API startup requires a Redis connection. If Redis becomes unavailable, login and password-reset rate-limit checks fail closed with service-unavailable responses. Restore Redis connectivity, then retry; rate-limit state may have expired during the outage. No queue or background worker is configured yet.

## Release and rollback

There is no production release pipeline. A future release must take a verified backup, run `prisma migrate deploy` as a controlled step, deploy compatible API/web artifacts, and run health/auth smoke tests. No automatic schema rollback is provided. For a failed migration or incompatible schema, stop rollout and follow the approved database restore/forward-fix procedure; do not run an improvised destructive SQL rollback.

## Security incident first response

1. Restrict access to affected systems and preserve relevant logs; do not post secrets or personal data in tickets.
2. Revoke affected sessions and rotate exposed credentials through the owning provider/secret manager.
3. Preserve a timeline and identify affected users/data without copying sensitive contents unnecessarily.
4. Escalate according to the organization's incident and legal notification policy. That policy and owner are not yet defined in this project.
5. Restore service only after the exposure path is contained and credentials/configuration are verified.
