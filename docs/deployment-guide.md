# Deployment Guide

The CI/CD pipelines defined in `.github/workflows` handle most heavy lifting. Below are the infrastructure expectations for successful deployment.

## Prerequisites
1. **Database**: Managed PostgreSQL instance (e.g., Supabase, Neon, AWS RDS). Update `DATABASE_URL` in environment secrets.
2. **Cache & Queue**: Managed Redis instance (e.g., Upstash, AWS ElastiCache) used by the Feature Flags system and the AI BullMQ Orchestrator. Update `REDIS_URL`, `REDIS_HOST`, and `REDIS_PORT`.
3. **Frontend Target**: Vercel Serverless Edge Network (or AWS Amplify).
4. **Backend Services Target**: AWS App Runner, ECS, or Kubernetes (for the Node.js standalone and BullMQ Docker workers).

## Deployment Step-by-Step

### 1. Database Migrations
Before deploying the Node backend, apply the Prisma schema changes:
```bash
pnpm -F @repo/database db:push
# OR for production: pnpm -F @repo/database prisma migrate deploy
```

### 2. Frontend / Monolithic Application (`apps/web`)
If using Vercel, simply import the Monorepo into Vercel and set the Root Directory to `apps/web`. Vercel automatically detects the Next.js framework and `pnpm workspaces`.

### 3. Deploying the AI Loop Service
The AI Loop (`ai-runtime`) consists of long-running consumers and MUST NOT be deployed to serverless environments with timeout limits.
- Containerize the `ai-runtime` and `ai-agents`.
- Provide the Docker Sandbox privileges if running on Kubernetes using `privileged: true` or by binding `/var/run/docker.sock`, so the QA Agent can spin up sibling containers dynamically to test code.

### 4. GitHub Actions (Production)
The `deploy.yml` pipeline triggers only when code is merged into `main` and both the Builder and Vitest Unit checks succeed. Ensure the following secrets are populated inside GitHub Repository Settings:
- `VERCEL_TOKEN` 
- `AWS_ACCESS_KEY` & `AWS_SECRET_KEY`
- `OPENAI_API_KEY` (For AI Dev Agent completions)
