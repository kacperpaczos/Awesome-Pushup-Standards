import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { DEFAULT_AUDIT_RIGOR, type AuditRigor } from '@awesome-pushup-standards/audit-contract';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { runTool, skippedAudit } from './lib/run-tool.js';

export type RunnerOptions = { rootDir?: string; rigor?: AuditRigor };

async function hasScannerInCi(rootDir: string): Promise<boolean> {
  const workflows = join(rootDir, '.github', 'workflows');
  if (!existsSync(workflows)) return false;
  const files = await readdir(workflows);
  for (const file of files) {
    const content = await readFile(join(workflows, file), 'utf8');
    if (/trivy|grype|docker scout/i.test(content)) return true;
  }
  return false;
}

export function createRunner(options: RunnerOptions = {}) {
  const rootDir = options.rootDir ?? '.';
  const rigor = options.rigor ?? DEFAULT_AUDIT_RIGOR;

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const dockerfile = join(rootDir, 'Dockerfile');
    const hasDockerfile = existsSync(dockerfile);

    let hadolintOut: AuditOutput;
    if (!hasDockerfile) {
      hadolintOut = {
        slug: 'hadolint-violations',
        value: 0,
        score: 1,
        displayValue: 'no Dockerfile — skipped',
      };
    } else {
      const hadolint = await runTool('hadolint', [dockerfile], rootDir);
      hadolintOut =
        hadolint.status === 'skipped'
          ? skippedAudit('hadolint-violations', 'hadolint', rigor)
          : {
              slug: 'hadolint-violations',
              value: hadolint.status === 'ok' ? 0 : 1,
              score: hadolint.status === 'ok' ? 1 : 0,
              displayValue: hadolint.status === 'ok' ? 'no violations' : 'hadolint violations',
            };
    }

    let multiStageOut: AuditOutput;
    if (!hasDockerfile) {
      multiStageOut = {
        slug: 'multi-stage-build',
        value: 0,
        score: 1,
        displayValue: 'no Dockerfile — skipped',
      };
    } else {
      const content = await readFile(dockerfile, 'utf8');
      const fromCount = (content.match(/^FROM /gim) ?? []).length;
      multiStageOut = {
        slug: 'multi-stage-build',
        value: fromCount >= 2 ? 0 : 1,
        score: fromCount >= 2 ? 1 : 0,
        displayValue: fromCount >= 2 ? 'multi-stage' : 'single-stage — consider multi-stage',
      };
    }

    const imageSizeOut: AuditOutput = {
      slug: 'image-size',
      value: 0,
      score: 1,
      displayValue: 'informational — configure image size budget in CI',
    };

    const scannerOk = await hasScannerInCi(rootDir);
    const vulnOut: AuditOutput = {
      slug: 'image-vulnerabilities',
      value: scannerOk ? 0 : 1,
      score: scannerOk ? 1 : 0,
      displayValue: scannerOk ? 'scanner in CI' : 'missing — add trivy or grype to CI',
    };

    return [hadolintOut, multiStageOut, imageSizeOut, vulnOut];
  };
}
