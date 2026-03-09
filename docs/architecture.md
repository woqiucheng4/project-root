# Architecture

This project is a **monorepo SaaS platform** built for AI-driven development.

---

## Directory Structure

```
project-root/
├── apps/
│   ├── web/          → Next.js 14 (App Router) — customer-facing web app
│   └── mobile/       → React Native (Expo) — iOS & Android app
├── services/
│   └── api/          → Express REST API
│       ├── controllers/   → Request handlers (thin layer, delegates to services)
│       ├── routes/        → Express route definitions
│       ├── services/      → Business logic
│       └── middleware/    → Auth, validation, logging middleware
├── packages/
│   ├── ui/           → Shared React components (web + mobile where possible)
│   ├── auth/         → JWT auth logic, middleware, token refresh
│   ├── database/     → Prisma client, schema files, migrations
│   ├── ai-sdk/       → OpenAI/LLM wrappers and utilities
│   ├── payments/     → Stripe integration, subscription logic
│   ├── analytics/    → Event tracking utilities
│   └── utils/        → Shared helpers (dates, strings, validation, etc.)
├── ai-system/
│   └── module-generator/ → AI-powered code generation system
├── docs/             → Architecture, product, and AI context docs
├── tests/
│   ├── api/          → API integration tests
│   └── ui/           → UI component tests
└── .antigravity/     → Antigravity AI configuration (skills, prompts, registries)
```

---

## Data Flow

```
Client (Web/Mobile)
      │
      ▼
  Express API (services/api)
      │
      ├─ packages/auth      → Authenticate request
      ├─ packages/database  → Prisma query
      ├─ packages/ai-sdk    → LLM calls (if needed)
      └─ packages/payments  → Stripe calls (if needed)
```

---

## API Design

- **Style**: RESTful
- **Base URL**: `/api/v1/`
- **Auth**: `Authorization: Bearer <JWT>` header
- **Response format**:
  ```json
  // Success
  { "data": { ... } }
  
  // Error
  { "error": "Human-readable message", "code": "ERROR_CODE" }
  ```
- **Pagination**: `?page=1&limit=20` query params, response includes `{ data: [], total, page, limit }`

---

## Authentication Flow

```
1. POST /api/v1/auth/register → create user → return { accessToken, refreshToken }
2. POST /api/v1/auth/login    → verify password → return { accessToken, refreshToken }
3. POST /api/v1/auth/refresh  → verify refreshToken → return new { accessToken }
4. POST /api/v1/auth/logout   → invalidate refreshToken
```

- `accessToken`: short-lived JWT (15 min)
- `refreshToken`: long-lived (7 days), stored in httpOnly cookie

---

## Service Layer Pattern

Controllers must be thin — delegate all business logic to services:

```typescript
// ✅ Correct
class UserController {
  async create(req, res) {
    const user = await this.userService.create(req.body); // logic in service
    res.status(201).json({ data: user });
  }
}

// ❌ Wrong — business logic in controller
class UserController {
  async create(req, res) {
    const hashed = await bcrypt.hash(req.body.password, 10); // belongs in service
    const user = await db.user.create({ data: { ...req.body, password: hashed } });
    res.status(201).json(user);
  }
}
```

---

## Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `user-profile.service.ts` |
| Classes | PascalCase | `UserProfileService` |
| Functions/vars | camelCase | `getUserById` |
| DB tables | snake_case plural | `user_profiles` |
| API routes | kebab-case plural | `/api/v1/user-profiles` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |
