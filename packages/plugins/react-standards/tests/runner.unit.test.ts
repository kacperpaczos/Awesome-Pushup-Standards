import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRunner } from '../src/runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, 'fixtures');

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('react-standards runner', () => {
  it('scores high for complete React stack', async () => {
    const outputs = await createRunner({
      packageJsonPath: join(fixtures, 'complete-package.json'),
    })(runnerArgs);
    const core = outputs.filter((o) =>
      ['react-version', 'recommended-state-libs', 'hooks-rules', 'forms-validation'].includes(
        o.slug,
      ),
    );
    expect(core.every((o) => o.score === 1)).toBe(true);
    expect(outputs.find((o) => o.slug === 'bundle-size')?.score).toBe(1);
    expect(outputs.find((o) => o.slug === 'accessibility')?.score).toBe(1);
  });

  it('scores low for minimal React 18 project', async () => {
    const outputs = await createRunner({
      packageJsonPath: join(fixtures, 'minimal-package.json'),
    })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'react-version')?.score).toBe(0);
    expect(outputs.find((o) => o.slug === 'recommended-state-libs')?.score).toBe(0);
  });
});
