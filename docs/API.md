# API Conventions

The API target is NestJS REST under `/api/v1`.

Success response:

```json
{ "data": {}, "meta": { "requestId": "..." } }
```

Error response:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Dữ liệu không hợp lệ", "details": [] }, "meta": { "requestId": "..." } }
```

All request bodies are validated at the server boundary. List endpoints use consistent server-side pagination and allowlisted sort/filter parameters. Swagger/OpenAPI will be exposed by the API application in Phase 1; this document will be updated with the actual endpoint catalog after implementation.
