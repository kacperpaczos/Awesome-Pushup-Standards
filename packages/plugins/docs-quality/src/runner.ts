import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type RunnerOptions = {
  rootDir?: string;
};

function auditResult(slug: string, present: boolean, hint: string, file?: string): AuditOutput {
  return {
    slug,
    value: present ? 0 : 1,
    score: present ? 1 : 0,
    displayValue: present ? 'present' : `missing — ${hint}`,
    details: present
      ? undefined
      : {
          issues: [
            {
              message: hint,
              severity: 'warning',
              source: file ? { file, position: { startLine: 1 } } : undefined,
            },
          ],
        },
  };
}

async function readOptional(path: string): Promise<string> {
  if (!existsSync(path)) return '';
  return readFile(path, 'utf8');
}

function hasSection(content: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(content));
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const readmePath = join(root, 'README.md');
    const readme = await readOptional(readmePath);
    const readmeOk =
      readme.length > 0 &&
      hasSection(readme, [/^#+\s*install/im, /^#+\s*usage/im, /^#+\s*getting started/im]);

    const changelogPath = join(root, 'CHANGELOG.md');
    const changelogInReadme = /changelog/i.test(readme);
    const hasChangelog = existsSync(changelogPath) || changelogInReadme;

    const licenseOk = existsSync(join(root, 'LICENSE')) || existsSync(join(root, 'LICENSE.md'));

    const contributingPath = join(root, 'CONTRIBUTING.md');
    const contributingOk = existsSync(contributingPath);

    return [
      auditResult(
        'readme-completeness',
        readmeOk,
        'add README with Install and Usage sections',
        readmePath,
      ),
      auditResult(
        'has-changelog',
        hasChangelog,
        'add CHANGELOG.md or a changelog section in README',
        changelogPath,
      ),
      auditResult('has-license', licenseOk, 'add LICENSE or LICENSE.md', join(root, 'LICENSE')),
      auditResult('has-contributing', contributingOk, 'add CONTRIBUTING.md', contributingPath),
    ];
  };
}
