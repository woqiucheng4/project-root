# AI Autonomous Coding Loop Platform

This is a production-grade AI SaaS monorepo powered by Node.js, TypeScript, and PNPM workspaces.

## Folder Structure

- **apps/**: End-user facing applications (e.g., web dashboard, CLI).
- **services/**: Backend microservices (e.g., API gateway, database service).
- **packages/**: Shared logic, domain models, utilities, and UI components.
- **ai-agents/**: Sub-agents responsible for specific cognitive tasks (e.g., planning, coding, reviewing).
- **ai-runtime/**: The core execution loop orchestration that handles state, memory, and LLM integrations.
- **devops/**: Deployment scripts, CI/CD pipelines, and configuration.
- **infrastructure/**: Infrastructure as Code (IaC) like Terraform or Pulumi.
- **docs/**: Architectural documentation, ADRs, and guides.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run formatting
pnpm format
```
