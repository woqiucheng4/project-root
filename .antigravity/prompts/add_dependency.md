Goal:
Add a new npm dependency to the correct package in the monorepo.

Dependency request:
{DEPENDENCY}

Process:

## Step 1 — Justify the dependency

Before installing, answer:
1. What exact problem does this solve?
2. Is there already a package in the project that provides this? (check packages/)
3. Is there a lighter-weight alternative?
4. What is the npm weekly downloads and last publish date? (check npmjs.com)
5. Does it have TypeScript types (`@types/` or built-in)?

## Step 2 — Identify the correct package

| If needed by | Install in |
|-------------|-----------|
| Web app only | `apps/web` |
| Mobile app only | `apps/mobile` |
| API only | `services/api` |
| Both web and mobile | `packages/ui` or `packages/utils` |
| All packages | root (rare — only for tooling) |

## Step 3 — Install command

```bash
# Add to a specific app/service
pnpm --filter @repo/web add {package-name}

# Add to a shared package
pnpm --filter @repo/utils add {package-name}

# Add as dev dependency
pnpm --filter @repo/api add -D {package-name}
```

## Step 4 — Record the decision

Add an entry to this section noting:
- Package name and version
- Why it was added
- Which workspace it was added to

## Installed Dependencies Log

| Package | Version | Added to | Reason |
|---------|---------|----------|--------|
| (none yet) | | | |
