import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import {
  DEFAULT_AUDIT_RIGOR,
  toolMissingAudit,
  type AuditRigor,
} from '@awesome-pushup-standards/audit-contract';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  detectPackageManager,
  hasGitleaksConfig,
  hasSastTooling,
  hasSyftInCi,
} from './lib/detect.js';

const execFileAsync = promisify(execFile);

export type RunnerOptions = {
  rootDir?: string;
  rigor?: AuditRigor;
};

function result(slug: string, score: number, displayValue: string, message?: string): AuditOutput {
  return {
    slug,
    value: 1 - score,
    score,
    displayValue,
    details: message
      ? { issues: [{ message, severity: score < 1 ? 'warning' : 'info' }] }
      : undefined,
  };
}

async function runDependencyAudit(root: string, rigor: AuditRigor): Promise<AuditOutput> {
  const pm = detectPackageManager(root);

  if (pm === 'npm') {
    try {
      const { stdout } = await execFileAsync('npm', ['audit', '--json'], {
        cwd: root,
        maxBuffer: 10 * 1024 * 1024,
      });
      const data = JSON.parse(stdout) as { metadata?: { vulnerabilities?: { total?: number } } };
      const total = data.metadata?.vulnerabilities?.total ?? 0;
      return result(
        'dependency-audit',
        total === 0 ? 1 : 0,
        total === 0 ? 'no vulnerabilities' : `${total} vulnerabilities`,
        total > 0 ? `npm audit found ${total} vulnerabilities` : undefined,
      );
    } catch (error: unknown) {
      const err = error as { stdout?: string; code?: number };
      if (err.stdout) {
        try {
          const data = JSON.parse(err.stdout) as {
            metadata?: { vulnerabilities?: { total?: number } };
          };
          const total = data.metadata?.vulnerabilities?.total ?? 1;
          return result(
            'dependency-audit',
            0,
            `${total} vulnerabilities`,
            `npm audit found ${total} vulnerabilities`,
          );
        } catch {
          // fall through
        }
      }
      return result(
        'dependency-audit',
        1,
        'npm audit skipped',
        'npm audit could not run — skipped',
      );
    }
  }

  if (pm === 'pip') {
    try {
      await execFileAsync('pip-audit', ['--format=json'], { cwd: root });
      return result('dependency-audit', 1, 'no vulnerabilities');
    } catch (error: unknown) {
      const err = error as { code?: string | number };
      if (err.code === 'ENOENT') {
        return toolMissingAudit('dependency-audit', 'pip-audit', rigor);
      }
      return result(
        'dependency-audit',
        0,
        'vulnerabilities found',
        'pip-audit reported vulnerabilities',
      );
    }
  }

  if (pm === 'cargo') {
    try {
      await execFileAsync('cargo', ['audit'], { cwd: root });
      return result('dependency-audit', 1, 'no advisories');
    } catch (error: unknown) {
      const err = error as { code?: string | number };
      if (err.code === 'ENOENT') {
        return toolMissingAudit('dependency-audit', 'cargo audit', rigor);
      }
      return result('dependency-audit', 0, 'advisories found', 'cargo audit reported advisories');
    }
  }

  return result('dependency-audit', 1, 'no package manager detected — skipped');
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';
  const rigor = options.rigor ?? DEFAULT_AUDIT_RIGOR;

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const secretsOk = await hasGitleaksConfig(root);
    const sastOk = await hasSastTooling(root);
    const sbomOk = await hasSyftInCi(root);
    const dependencyAudit = await runDependencyAudit(root, rigor);

    return [
      result(
        'secrets-detected',
        secretsOk ? 1 : 0,
        secretsOk ? 'secrets scanning configured' : 'missing — configure gitleaks or trufflehog',
        secretsOk ? undefined : 'add .gitleaks.toml or secrets scan in CI',
      ),
      dependencyAudit,
      result(
        'sast-findings',
        sastOk ? 1 : 0,
        sastOk ? 'SAST tooling present' : 'missing — add bandit/semgrep',
        sastOk ? undefined : 'configure SAST tooling for your stack',
      ),
      result(
        'sbom-generated',
        sbomOk ? 1 : 0,
        sbomOk ? 'SBOM in CI' : 'informational — no SBOM in CI',
        sbomOk ? undefined : 'consider syft for SBOM generation in CI',
      ),
    ];
  };
}
