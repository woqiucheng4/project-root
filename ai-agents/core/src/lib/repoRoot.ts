import fs from 'fs';
import path from 'path';

/**
 * Resolve monorepo root by walking up until pnpm-workspace.yaml is found.
 * Falls back to MONOREPO_ROOT env or process.cwd().
 */
export function findMonorepoRoot(): string {
  if (process.env.MONOREPO_ROOT) {
    return path.resolve(process.env.MONOREPO_ROOT);
  }
  let dir = __dirname;
  for (let i = 0; i < 16; i++) {
    const marker = path.join(dir, 'pnpm-workspace.yaml');
    if (fs.existsSync(marker)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return process.cwd();
}
