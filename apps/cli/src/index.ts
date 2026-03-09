#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('\x1b[31mError: Please provide a module name (kebab-case).\x1b[0m');
  console.log('Usage: pnpm dev:generate <module-name>');
  process.exit(1);
}

// Ensure the module name is in correct formats
const isKebab = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(moduleName);
if (!isKebab) {
  console.error('\x1b[31mError: Module name has to be kebab-case (e.g., user-profile, feature-flags).\x1b[0m');
  process.exit(1);
}

const toPascalCase = (str: string) => str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
const toCamelCase = (str: string) => str.split('-').map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)).join('');

const pascalName = toPascalCase(moduleName);
const camelName = toCamelCase(moduleName);
const serviceName = `${pascalName}Service`;

const ROOT_DIR = path.resolve(__dirname, '../../..');

const paths = {
  prisma: path.join(ROOT_DIR, 'packages/database/prisma/schema.prisma'),
  serviceDir: path.join(ROOT_DIR, `packages/core-services/src/${moduleName}`),
  serviceIndex: path.join(ROOT_DIR, 'packages/core-services/src/index.ts'),
  apiRouteDir: path.join(ROOT_DIR, `apps/web/app/api/${moduleName}`),
  frontendDir: path.join(ROOT_DIR, `apps/web/app/${moduleName}`)
};

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

async function appendToFile(file: string, content: string) {
  await fs.appendFile(file, `\n${content}`);
}

async function writeToFile(file: string, content: string) {
  await fs.writeFile(file, content.trim() + '\n');
}

async function run() {
  console.log(`Generating SaaS module for: \x1b[36m${moduleName}\x1b[0m\n`);

  try {
    // 1. Prisma Schema Update
    console.log('1. Updating Prisma Schema...');
    const schemaAppend = `
// ==========================================
// Module: ${pascalName}
// ==========================================
model ${pascalName}Item {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`;
    await appendToFile(paths.prisma, schemaAppend);

    // 2. Service Layer
    console.log('2. Creating Service Layer...');
    await ensureDir(paths.serviceDir);
    
    const serviceContent = `
import { prisma } from '@repo/database';

export class ${serviceName} {
  async getItems(userId: string) {
    return prisma.${camelName}Item.findMany({ where: { userId } });
  }

  async createItem(userId: string, name: string) {
    return prisma.${camelName}Item.create({ data: { userId, name } });
  }
}
`;
    await writeToFile(path.join(paths.serviceDir, 'service.ts'), serviceContent);

    // 3. Service Layer Tests
    console.log('3. Creating Service Tests...');
    const testContent = `
import { describe, it, expect } from 'vitest';
import { ${serviceName} } from './service';

describe('${serviceName}', () => {
  it('should be defined', () => {
    expect(new ${serviceName}()).toBeDefined();
  });
});
`;
    await writeToFile(path.join(paths.serviceDir, 'service.test.ts'), testContent);

    // 4. Update core-services exports
    console.log('4. Updating core-services index exports...');
    await appendToFile(paths.serviceIndex, `export * from './${moduleName}/service';`);

    // 5. API Route (Next.js App Router)
    console.log('5. Creating API Route Controller...');
    await ensureDir(paths.apiRouteDir);
    const apiRouteContent = `
import { NextResponse } from 'next/server';
import { ${serviceName} } from '@repo/core-services';

const ${camelName}Service = new ${serviceName}();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const items = await ${camelName}Service.getItems(userId);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { userId, name } = await request.json();
  
  if (!userId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const item = await ${camelName}Service.createItem(userId, name);
  return NextResponse.json(item);
}
`;
    await writeToFile(path.join(paths.apiRouteDir, 'route.ts'), apiRouteContent);

    // 6. Frontend Page
    console.log('6. Creating Frontend Page...');
    await ensureDir(paths.frontendDir);
    const pageContent = `
import React from 'react';

export default function ${pascalName}Page() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">${pascalName} Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your ${pascalName.toLowerCase()} settings and records here.</p>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Recent Items</h2>
        <div className="text-gray-500 text-sm">
          A list of ${camelName} items will appear here once loaded from the API.
        </div>
      </div>
    </div>
  );
}
`;
    await writeToFile(path.join(paths.frontendDir, 'page.tsx'), pageContent);

    // 7. E2E Tests (Playwright)
    console.log('7. Creating E2E Playwright Tests...');
    const e2eDir = path.join(ROOT_DIR, 'apps/web/tests/e2e');
    await ensureDir(e2eDir);
    const e2eContent = `
import { test, expect } from '@playwright/test';

test('${camelName} module dashboard loads', async ({ page }) => {
  await page.goto('/${moduleName}');
  await expect(page.locator('h1')).toHaveText('${pascalName} Dashboard');
});
`;
    await writeToFile(path.join(e2eDir, `${moduleName}.spec.ts`), e2eContent);

    console.log('\n\x1b[32m✔ Successfully generated module!\x1b[0m');
    console.log('\x1b[33mRemember to run `pnpm -F @repo/database db:generate` to apply schema changes to Prisma Client.\x1b[0m');

  } catch (err: any) {
    console.error('\n\x1b[31mError generating module:\x1b[0m', err.message);
    process.exit(1);
  }
}

run();
