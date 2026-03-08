Goal:
Generate a complete SaaS module from a single feature request.

Module:
{MODULE}

Steps:

1. Read ai-system/module-generator/generators/index.ts for generation rules.
2. Check ai-system/module-generator/registry/modules.json to avoid duplicates.
3. Generate database schema using templates/database/schema.template.
   Output to: packages/database/prisma/{moduleName}.prisma
4. Generate API controller using templates/api/controller.template.
   Output to: services/api/controllers/{moduleName}.controller.ts
5. Generate API routes using templates/api/routes.template.
   Output to: services/api/routes/{moduleName}.routes.ts
6. Generate service layer using templates/service/service.template.
   Output to: services/api/services/{moduleName}.service.ts
7. Generate web UI using templates/ui/page.template.
   Output to: apps/web/src/app/{routePath}/page.tsx
8. Generate mobile screen using templates/ui/mobile-screen.template.
   Output to: apps/mobile/src/screens/{ModuleName}Screen.tsx
9. Generate API tests using templates/tests/api.test.template.
   Output to: tests/api/{moduleName}.test.ts
10. Generate UI tests using templates/tests/ui.test.template.
    Output to: tests/ui/{moduleName}.test.tsx
11. Register module in ai-system/module-generator/registry/modules.json.
12. Update .antigravity/module_registry.md with the new module.

Naming:
- ModuleName: PascalCase singular (e.g. MeetingNote)
- moduleName: camelCase singular (e.g. meetingNote)
- routePath: kebab-case plural (e.g. meeting-notes)

Follow project architecture.
Reuse packages when possible.
