import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Allow using describe, it, expect without importing
    environment: 'node',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
