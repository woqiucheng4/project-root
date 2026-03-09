# Development Workflow

## 1. Setup Environment
Ensure you have Docker, Node.js 20+, `pnpm`, and Redis installed locally.

```bash
# Install Monorepo dependencies
pnpm install

# Generate Prisma Client models
pnpm -F @repo/database db:generate
```

## 2. Using the CLI Generator
We've built an internal scaffolding tool to create standard SaaS modules instantly:
```bash
pnpm run generate <module-name>
# Example: pnpm run generate subscription-manager
```
This command automatically sets up:
- Database schema changes (`schema.prisma`)
- Service layer (`service.ts`) and Vitest suites (`service.test.ts`)
- Next.js API Routes and Page placeholders (`route.ts`, `page.tsx`)
- Playwright E2E spec files

## 3. Running Services
- **Frontend App**: `cd apps/web && pnpm dev` (Runs on port 3000)
- **AI Runtime Environment**: `cd ai-runtime && pnpm dev` (Requires Redis active at port 6379)

## 4. Testing
- **Unit & Integration**: `pnpm -r run test` (Runs Vitest across all services)
- **E2E Testing**: `pnpm -F web test:e2e` (Runs Playwright browser simulation)

## 5. Standard Commits
All PRs must be CI/CD verified. The AI will also adhere to Conventional Commits when pushing branches. Before pushing code manually, ensure `pnpm -r run test` passes locally.
