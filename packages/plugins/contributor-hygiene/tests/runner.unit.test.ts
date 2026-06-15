import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRunner } from '../src/runner.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('contributor-hygiene', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'contributor-hygiene-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('scores low when shift-left tooling is missing', async () => {
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.every((o) => o.score === 0)).toBe(true);
  });

  it('scores high when shift-left tooling is present', async () => {
    await writeFile(join(dir, 'commitlint.config.js'), 'export default {};\n');
    await mkdir(join(dir, '.husky'), { recursive: true });
    await writeFile(join(dir, '.husky/commit-msg'), 'npx commitlint --edit $1\n');
    await writeFile(join(dir, '.husky/pre-commit'), 'npx lint-staged\n');
    await writeFile(
      join(dir, 'package.json'),
      JSON.stringify({
        scripts: { commit: 'git-cz' },
        config: { commitizen: { path: '@commitlint/cz-commitlint' } },
      }),
    );
    await writeFile(join(dir, '.editorconfig'), 'root = true\n');
    await writeFile(join(dir, '.prettierrc'), '{}\n');
    await writeFile(join(dir, 'knip.config.ts'), 'export default {};\n');
    await writeFile(join(dir, '.env.example'), '# env\n');

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.every((o) => o.score === 1)).toBe(true);
  });
});
