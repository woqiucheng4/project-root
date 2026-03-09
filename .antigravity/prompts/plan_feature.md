Goal:
Plan a feature as concrete engineering tasks before implementation begins.

Feature:
{FEATURE}

Pre-flight checks:
1. Read docs/product.md for business context and priority.
2. Read docs/architecture.md for technical constraints.
3. Check .antigravity/module_registry.md for existing modules to reuse.

Output format:

## Product Goal
(One sentence: what user problem does this solve?)

## Scope
- In scope: (specific what WILL be built)
- Out of scope: (what will NOT be included in this iteration)

## Affected Components
List every file or package that needs to change.

## Engineering Tasks
| # | Task | Layer | Estimate | Depends on |
|---|------|-------|----------|------------|
| 1 | ... | Backend | S/M/L | - |
| 2 | ... | Frontend | S/M/L | #1 |

(S = < 1hr, M = half day, L = full day)

## Database Changes
- List any new Prisma models or field additions.
- Specify if a migration is needed.

## API Changes
- List new endpoints or modifications to existing ones.
- Note breaking changes.

## Risks & Open Questions
- List unknowns that need decisions before implementation.
- Flag anything that could affect packages/auth or packages/payments.

## Definition of Done
- [ ] All tasks implemented and passing TypeScript checks
- [ ] API tests written and passing
- [ ] UI tests written and passing
- [ ] module_registry.md updated if new modules created
- [ ] No `any` types introduced
