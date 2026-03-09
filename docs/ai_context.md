# AI Context

This file provides persistent project context for AI assistants.
Read this before making any changes to the codebase.

---

## Project Overview

**Name**: AI CTO SaaS Starter  
**Type**: Multi-tenant SaaS platform  
**Stage**: Early development (scaffolding phase)  
**Goal**: Demonstrate AI-driven full-stack development on a monorepo template.

---

## Current Status

### ✅ Completed
- Monorepo structure (`apps/`, `services/`, `packages/`)
- Core package scaffolding (`packages/ui`, `packages/auth`, `packages/database`, `packages/ai-sdk`, `packages/payments`, `packages/analytics`, `packages/utils`)
- AI module generation system (`ai-system/module-generator/`)
- Prompt templates for common tasks (`.antigravity/prompts/`)

### 🔄 In Progress
- Module generator implementation (`ai-system/module-generator/generators/index.ts`)
- First real module generation (to be determined)

### ❌ Not Started
- Authentication flow (login, register, JWT refresh)
- Payment/subscription integration (Stripe)
- Admin dashboard
- CI/CD pipeline
- Deployment configuration

---

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Monorepo tool | pnpm workspaces | Simpler than Nx/Turborepo for this scale |
| Frontend framework | Next.js 14 App Router | Server Components, built-in routing |
| ORM | Prisma | Type-safe, good migration tooling |
| Auth strategy | JWT + Refresh tokens | Stateless, works for API + mobile |
| Payment | Stripe | Industry standard, good DX |
| Testing | Vitest | Faster than Jest, ESM-native |

---

## Known Constraints & Gotchas

- **Mobile app** uses Expo managed workflow. Do NOT eject without discussion.
- **packages/auth** is security-critical. Always ask before modifying.
- **packages/payments** handles money. Always ask before modifying.
- `API_BASE_URL` in mobile templates is a placeholder — real URL comes from `EXPO_PUBLIC_API_URL` env var.
- Database is PostgreSQL. Do NOT use SQLite-specific syntax.
- pnpm workspace — use `pnpm --filter <package> add <dep>` to add deps to specific packages.

---

## Environment Variables

```
# Root .env (dev only, never commit)
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...

# apps/web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/mobile (.env)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## AI Assistant Rules

1. Always follow the architecture in `docs/architecture.md`.
2. Always check `module_registry.md` before creating new modules.
3. Prefer modifying existing files over creating new ones.
4. When unsure about scope, ask. Don't assume and generate large amounts of code.
5. After completing a task, list the files changed and why.
6. If a task requires a dependency not in the project, list it and ask for approval before proceeding.
