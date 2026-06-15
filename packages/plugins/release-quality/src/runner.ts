import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type RunnerOptions = { rootDir?: string };

function check(slug: string, present: boolean, ok: string, fail: string): AuditOutput {
  return {
    slug,
    value: present ? 0 : 1,
    score: present ? 1 : 0,
    displayValue: present ? ok : fail,
    details: present ? undefined : { issues: [{ message: fail, severity: 'warning' }] },
  };
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const workflowsDir = join(root, '.github', 'workflows');
    let publishContent = '';
    let releaseContent = '';
    let ciContent = '';
    let commitlintContent = '';

    if (existsSync(workflowsDir)) {
      const files = await crawlFileSystem({ directory: workflowsDir, pattern: /\.ya?ml$/ });
      for (const file of files) {
        const content = await readFile(file, 'utf8');
        if (/publish\.ya?ml$/i.test(file)) publishContent = content;
        if (/release\.ya?ml$/i.test(file)) releaseContent = content;
        if (/^ci\.ya?ml$/i.test(file.split('/').pop() ?? '')) ciContent = content;
        if (/commitlint/i.test(file)) commitlintContent = content;
      }
    }

    const oidcPublish =
      publishContent.includes('id-token: write') && !/NPM_TOKEN/i.test(publishContent);
    const separated = Boolean(releaseContent && publishContent);
    const hasSecurity = existsSync(join(root, 'SECURITY.md'));
    const hasCommitlint = Boolean(commitlintContent);
    const hasPkgPreview = /pkg-pr-new/i.test(ciContent);
    const hasReleaseEnv =
      /environment:\s*release/i.test(releaseContent) ||
      /environment:\s*release/i.test(publishContent);

    return [
      check(
        'npm-oidc-publish',
        oidcPublish,
        'OIDC publish configured',
        'missing — add id-token: write to publish.yml without NPM_TOKEN',
      ),
      check(
        'separated-release-publish',
        separated,
        'release.yml and publish.yml separated',
        'missing — split release and publish workflows',
      ),
      check('security-policy', hasSecurity, 'SECURITY.md present', 'missing — add SECURITY.md'),
      check(
        'pr-commitlint',
        hasCommitlint,
        'PR commitlint workflow',
        'missing — add pr-commitlint.yml',
      ),
      check(
        'pkg-preview-on-pr',
        hasPkgPreview,
        'pkg-pr-new in CI',
        'informational — add pkg-pr-new to CI',
      ),
      check(
        'release-environment',
        hasReleaseEnv,
        'release environment configured',
        'informational — add environment: release',
      ),
    ];
  };
}
