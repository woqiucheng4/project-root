// Module Generator - Main Entry
// AI reads this file to understand how to generate a module
//
// USAGE:
//   Create module: {MODULE_NAME}
//
// FLOW:
//   1. Read templates from ai-system/module-generator/templates/
//   2. Replace {{ModuleName}} with PascalCase module name
//   3. Replace {{moduleName}} with camelCase module name
//   4. Replace {{routePath}} with kebab-case route path
//   5. Generate files to correct directories
//   6. Register module in registry/modules.json
//
// OUTPUT FILES:
//   packages/database/prisma/{{moduleName}}.prisma
//   services/api/controllers/{{moduleName}}.controller.ts
//   services/api/routes/{{moduleName}}.routes.ts
//   services/api/services/{{moduleName}}.service.ts
//   apps/web/src/app/{{routePath}}/page.tsx
//   apps/mobile/src/screens/{{ModuleName}}Screen.tsx
//   tests/api/{{moduleName}}.test.ts
//   tests/ui/{{moduleName}}.test.tsx
//
// NAMING CONVENTION:
//   Input: "meeting-notes"
//   ModuleName: "MeetingNote"     (PascalCase, singular)
//   moduleName: "meetingNote"     (camelCase, singular)
//   routePath:  "meeting-notes"   (kebab-case, plural)
//
// RULES:
//   - Always check registry/modules.json before generating
//   - Do not overwrite existing modules
//   - Follow project architecture in docs/architecture.md
//   - Use packages/database for schema
//   - Use services/api for backend logic
//   - Use apps/web and apps/mobile for frontend
