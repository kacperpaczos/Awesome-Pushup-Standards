import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { readJsonFile } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type RunnerOptions = { rootDir?: string };

function check(
  slug: string,
  present: boolean,
  ok: string,
  fail: string,
  file?: string,
): AuditOutput {
  return {
    slug,
    value: present ? 0 : 1,
    score: present ? 1 : 0,
    displayValue: present ? ok : fail,
    details: present
      ? undefined
      : {
          issues: [
            {
              message: fail,
              severity: 'warning',
              source: file ? { file, position: { startLine: 1 } } : undefined,
            },
          ],
        },
  };
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const commitlint = existsSync(join(root, 'commitlint.config.js'));
    const huskyCommitMsg = existsSync(join(root, '.husky/commit-msg'));
    const huskyPreCommit = existsSync(join(root, '.husky/pre-commit'));

    let commitScript = false;
    let commitizen = false;
    if (existsSync(join(root, 'package.json'))) {
      const pkg = await readJsonFile<{ scripts?: Record<string, string>; config?: unknown }>(
        join(root, 'package.json'),
      );
      commitScript = typeof pkg.scripts?.commit === 'string';
      commitizen = Boolean(
        pkg.config && typeof pkg.config === 'object' && 'commitizen' in (pkg.config as object),
      );
    }

    let huskyHasCommitlint = false;
    if (huskyCommitMsg) {
      const hook = await readFile(join(root, '.husky/commit-msg'), 'utf8');
      huskyHasCommitlint = /commitlint/i.test(hook);
    }

    return [
      check(
        'conventional-commits',
        commitlint && huskyCommitMsg && huskyHasCommitlint,
        'commitlint + husky commit-msg',
        'missing — add commitlint.config.js and .husky/commit-msg',
        'commitlint.config.js',
      ),
      check(
        'pre-commit-hooks',
        huskyPreCommit,
        'husky pre-commit configured',
        'missing — add .husky/pre-commit',
        '.husky/pre-commit',
      ),
      check(
        'commitizen-configured',
        commitScript && commitizen,
        'commitizen via npm run commit',
        'missing — add commit script and commitizen config',
        'package.json',
      ),
      check(
        'editorconfig-present',
        existsSync(join(root, '.editorconfig')),
        '.editorconfig present',
        'missing — add .editorconfig',
        '.editorconfig',
      ),
      check(
        'prettier-configured',
        existsSync(join(root, '.prettierrc')) || existsSync(join(root, 'prettier.config.js')),
        'prettier configured',
        'missing — add .prettierrc',
        '.prettierrc',
      ),
      check(
        'knip-configured',
        existsSync(join(root, 'knip.config.ts')) || existsSync(join(root, 'knip.json')),
        'knip configured',
        'missing — add knip.config.ts',
        'knip.config.ts',
      ),
      check(
        'env-example-present',
        existsSync(join(root, '.env.example')),
        '.env.example present',
        'missing — add .env.example',
        '.env.example',
      ),
    ];
  };
}
