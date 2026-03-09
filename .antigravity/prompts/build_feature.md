Goal:
Implement a complete SaaS feature end-to-end, following monorepo architecture.

Feature:
{FEATURE}

Pre-flight checks (do these FIRST before writing any code):
1. Read docs/ai_context.md for project status and constraints.
2. Read docs/architecture.md for API design rules and service patterns.
3. Read .antigravity/module_registry.md — do NOT recreate existing modules.
4. Identify all packages from packages/ that can be reused.

Implementation steps:
1. Design: List the files to create or modify, and why.
2. Backend: Implement service layer → controller → routes (in this order).
3. Frontend: Implement data fetching → page/screen component.
4. Tests: Write API tests in tests/api/ and UI tests in tests/ui/.
5. Registry: Update .antigravity/module_registry.md if a new module was created.
6. Summary: List every changed file with a one-line explanation.

Constraints:
- Follow API response format: { data: ... } or { error: ..., code: ... }
- All routes must use auth middleware unless explicitly a public route.
- Reuse packages/ui components — do not create duplicate UI elements.
- Do not install new packages without listing them and getting approval.
- All new code must have TypeScript strict mode compliance (no `any`).
