# Database Design (Initial ERD)

Phase 0 defines the identity/access and platform foundation. CMS, documents, approvals, tasks and HR entities will be added through separate migrations in their respective phases.

```mermaid
erDiagram
  USERS ||--o| USER_PROFILES : has
  USERS ||--o| EMPLOYEES : maps_to
  DEPARTMENTS ||--o{ EMPLOYEES : contains
  POSITIONS ||--o{ EMPLOYEES : assigns
  EMPLOYEES }o--o| EMPLOYEES : manages
  USERS ||--o{ USER_ROLES : receives
  ROLES ||--o{ USER_ROLES : grants
  ROLES ||--o{ ROLE_PERMISSIONS : includes
  PERMISSIONS ||--o{ ROLE_PERMISSIONS : assigned
  USERS ||--o{ USER_SESSIONS : owns
  USERS ||--o{ PASSWORD_RESET_TOKENS : requests
  USERS ||--o{ AUDIT_LOGS : acts
```

## Conventions

- UUID or cuid primary keys: choose one consistently during Phase 1.
- `created_at` and `updated_at` on mutable entities; actor columns on audited entities.
- Unique email, employee code and permission key constraints.
- Foreign keys and deletion behavior are explicit.
- Timestamps stored in UTC.
- Sensitive HR and audit data is protected through API policy, not database exposure to the browser.
- Migration must run from an empty database; seed is development-only and guarded against production.
