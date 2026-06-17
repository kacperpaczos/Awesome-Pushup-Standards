#!/usr/bin/env node
/**
 * Run docs:sync and ensure generated documentation paths match git.
 *
 * Run: npm run docs:verify
 */
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED_DOC_PATHS } from './docs-generated-paths.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

execSync('node scripts/sync-docs-to-starlight.mjs', {
  cwd: repoRoot,
  stdio: 'inherit',
});

try {
  execSync(['git', 'diff', '--exit-code', '--', ...GENERATED_DOC_PATHS].join(' '), {
    cwd: repoRoot,
    stdio: 'inherit',
  });
} catch {
  console.error(
    'docs:verify failed — generated docs are out of sync. Run `npm run docs:sync` and commit the changes.',
  );
  process.exit(1);
}

console.info('docs:verify — generated documentation is in sync with packages/*/README.md');
