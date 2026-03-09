# Task Registry

## Available Task Types

| Task | Prompt File | Description |
|------|------------|-------------|
| `create_module` | prompts/create_module.md | Generate a full CRUD module (schema + API + UI + tests) |
| `create_saas` | prompts/create_saas.md | Generate an entire SaaS product from description |
| `build_feature` | prompts/build_feature.md | Implement a feature end-to-end |
| `build_api` | prompts/build_api.md | Create a specific REST API endpoint |
| `plan_feature` | prompts/plan_feature.md | Break a feature into engineering tasks |
| `fix_bug` | prompts/fix_bug.md | Diagnose and fix a bug systematically |
| `review` | prompts/review.md | Code review (security, performance, quality) |
| `db_migration` | prompts/db_migration.md | Run a Prisma database migration safely |
| `add_dependency` | prompts/add_dependency.md | Add a new npm dependency to the monorepo |

## Usage

Say to AI:
```
Use prompt: build_feature
Feature: {your feature description}
```

Or reference the prompt file directly in your AI tool.
