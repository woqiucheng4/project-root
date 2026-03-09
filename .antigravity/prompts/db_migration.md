Goal:
Run a database migration safely after a Prisma schema change.

Context:
{CONTEXT}

Steps:

## Development (local)

1. Make schema changes in `packages/database/prisma/schema.prisma`.
2. Run migration:
   ```bash
   pnpm --filter @repo/database exec prisma migrate dev --name {migration-name}
   ```
3. Regenerate Prisma client:
   ```bash
   pnpm --filter @repo/database exec prisma generate
   ```
4. Verify migration file created in `packages/database/prisma/migrations/`.

## Naming Migrations

Use descriptive snake_case names:
- add_user_subscription_fields
- create_meeting_notes_table
- add_index_on_user_email

## Rules

- NEVER edit existing migration files — create new migrations instead.
- NEVER use `prisma migrate reset` on production data.
- Always add indexes for columns used in WHERE/JOIN queries.
- For large tables (>100k rows), use `--create-only` and review the SQL before applying.
- If migration touches `users` table or auth-related fields, get explicit approval.

## Rollback

If a migration needs to be rolled back in development:
```bash
pnpm --filter @repo/database exec prisma migrate reset
```
This wipes dev data — only use in development.

## Post-migration checklist
- [ ] Migration file committed to git
- [ ] Prisma client regenerated
- [ ] TypeScript types updated (auto from generate)
- [ ] Relevant service/repository code updated to use new fields
- [ ] Tests updated to reflect schema changes
