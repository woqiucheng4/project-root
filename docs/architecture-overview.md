# Architecture Overview

## Monorepo Strategy
This project adopts a Monorepo architecture managed by **pnpm workspaces**. It allows us to keep our application, core logic, AI agents, and infrastructure side-by-side, sharing types and code easily.

## Key Boundaries

### 1. The Presentation Layer (`apps/web`)
- **Tech Stack**: Next.js (App Router), React, Tailwind CSS.
- **Responsibility**: End-user interfaces, SSR, and API endpoints serving the frontend.
- **Constraints**: Should not directly touch the database. All complex logic must be routed to `@repo/core-services`.

### 2. The Core Domain Layer (`packages/core-services`)
- **Tech Stack**: Node.js, TypeScript.
- **Responsibility**: Contains the business logic of the SaaS (Auth, Billing, Analytics, etc.).
- **Integration**: Depends on `@repo/database` and interacts with secondary utilities like Redis for caching or Feature Flags.

### 3. The Data Persistence Layer (`packages/database`)
- **Tech Stack**: PostgreSQL, Prisma ORM.
- **Responsibility**: The single source of truth for the database schema (`schema.prisma`) and the generated Prisma Client.

### 4. The AI Autonomous Code System (`ai-agents` & `ai-runtime`)
- **Tech Stack**: Node.js, BullMQ, Redis, Docker (Sandbox Execution), OpenAI/LLMs.
- **Responsibility**: 
  - `ai-agents`: Individually specialized agents orchestrating specific tasks like Dev, QA, Refactor, PR, and Doc.
  - `ai-runtime`: The loop orchestrator that pulls tasks, dispatches them, handles the queue, and maintains the infinite automation loop.

## Internal Interactions
- `apps/web` -> depends on -> `@repo/core-services` -> depends on -> `@repo/database`.
- `ai-runtime` -> depends on -> `@repo/ai-agents`.
- `ai-agents` executes and patches files within the Monorepo source tree securely using isolated `devops/sandbox` environments.
