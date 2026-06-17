import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function findRepoRoot(from = dirname(fileURLToPath(import.meta.url))): string {
  let dir = from;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'code-pushup.config.ts'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error('Could not find repository root');
}
