# Module Generator

AI-powered module generation system for SaaS features.

## How It Works

Input a feature request → AI generates a complete module.

## Generation Flow

```
Feature Request
      │
      ▼
Module Generator (ai-system/module-generator)
      │
      ├─ Schema Generator   → packages/database/prisma/
      ├─ API Generator      → services/api/controllers/ + routes/ + services/
      ├─ UI Generator       → apps/web/src/app/ + apps/mobile/src/screens/
      ├─ Test Generator     → tests/api/ + tests/ui/
      └─ Registry Update    → ai-system/module-generator/registry/
```

## Templates

| Template | Purpose | Output |
|----------|---------|--------|
| schema.template | Prisma database model | packages/database/prisma/ |
| controller.template | API controller (CRUD) | services/api/controllers/ |
| routes.template | Express routes | services/api/routes/ |
| service.template | Business logic | services/api/services/ |
| page.template | Next.js page | apps/web/src/app/ |
| mobile-screen.template | React Native screen | apps/mobile/src/screens/ |
| api.test.template | API integration tests | tests/api/ |
| ui.test.template | UI component tests | tests/ui/ |

## Naming Convention

| Input | ModuleName | moduleName | routePath |
|-------|-----------|------------|-----------|
| meeting-notes | MeetingNote | meetingNote | meeting-notes |
| user-profile | UserProfile | userProfile | user-profiles |
| ai-chat | AiChat | aiChat | ai-chats |

## Usage

Say to AI:

```
Create module: meeting-notes
```

AI generates 8+ files across the entire monorepo.
