Goal:
Create a production-ready REST API endpoint.

Endpoint:
{ENDPOINT}

Pre-flight checks:
1. Check .antigravity/module_registry.md — does a similar endpoint already exist?
2. Read docs/architecture.md for API design rules.

Implementation requirements:
- Route file: services/api/routes/{moduleName}.routes.ts
- Controller: services/api/controllers/{moduleName}.controller.ts (thin, delegates to service)
- Service: services/api/services/{moduleName}.service.ts (all business logic here)
- Use packages/database for Prisma queries.
- Use packages/auth middleware for protected routes: import { authMiddleware } from "@repo/auth"
- Input validation: use zod schema for request body validation.

Response format (mandatory):
```typescript
// Success
res.status(200).json({ data: result });

// Created
res.status(201).json({ data: created });

// Error
res.status(400).json({ error: "Validation failed", code: "VALIDATION_ERROR" });

// Not found
res.status(404).json({ error: "Resource not found", code: "NOT_FOUND" });
```

Error handling:
- Wrap service calls in try/catch in the controller.
- Never expose error.stack or internal error messages to the client.
- Log the full error server-side before sending the response.

After creating the endpoint:
- Write integration tests in tests/api/{moduleName}.test.ts.
- Register the router in services/api/app.ts (list the line to add).
- List all files created or modified.
