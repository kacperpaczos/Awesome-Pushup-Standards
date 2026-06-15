import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type RunnerOptions = {
  rootDir?: string;
};

const USES_LINE = /^\s*-\s*uses:\s*(.+)$/gm;
const SHA_PIN = /@[0-9a-f]{40}\b/i;
const VERSION_PIN = /@[vV]?\d+/;

type WorkflowStats = {
  files: string[];
  contents: string[];
  shaPins: number;
  versionPins: number;
  hasDepScan: boolean;
  hasPermissions: boolean;
  hasForkWorkflow: boolean;
  hasPullRequestTarget: boolean;
  hasReleaseConcurrency: boolean;
  hasMultiOs: boolean;
  hasNxAffected: boolean;
  hasDependencyReview: boolean;
};

function binary(
  slug: string,
  ok: boolean,
  okLabel: string,
  failLabel: string,
  message?: string,
): AuditOutput {
  return {
    slug,
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? okLabel : failLabel,
    details: message ? { issues: [{ message, severity: ok ? 'info' : 'warning' }] } : undefined,
  };
}

async function analyzeWorkflows(root: string): Promise<WorkflowStats> {
  const workflowsDir = join(root, '.github', 'workflows');
  const stats: WorkflowStats = {
    files: [],
    contents: [],
    shaPins: 0,
    versionPins: 0,
    hasDepScan: false,
    hasPermissions: true,
    hasForkWorkflow: false,
    hasPullRequestTarget: false,
    hasReleaseConcurrency: false,
    hasMultiOs: false,
    hasNxAffected: false,
    hasDependencyReview: false,
  };

  if (!existsSync(workflowsDir)) {
    stats.hasPermissions = false;
    return stats;
  }

  const files = await crawlFileSystem({
    directory: workflowsDir,
    pattern: /\.(ya?ml)$/,
  });
  stats.files = files;

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    stats.contents.push(content);

    if (/dependency-review/i.test(file) || /dependency-review-action/i.test(content)) {
      stats.hasDependencyReview = true;
    }
    if (/fork/i.test(file) || /pull_request_target/i.test(content)) {
      stats.hasForkWorkflow = /fork/i.test(file);
      stats.hasPullRequestTarget = /pull_request_target/i.test(content);
    }
    if (/trivy|pip-audit|npm audit|dependency-review|osv-scanner/i.test(content)) {
      stats.hasDepScan = true;
    }
    if (!/^permissions:/m.test(content) && !/^ {2}permissions:/m.test(content)) {
      stats.hasPermissions = false;
    }
    if (
      (/release\.ya?ml/i.test(file) || /publish\.ya?ml/i.test(file)) &&
      /concurrency:/i.test(content) &&
      /cancel-in-progress:\s*false/i.test(content)
    ) {
      stats.hasReleaseConcurrency = true;
    }
    if (/matrix:\s*\n\s*os:/i.test(content) && /windows/i.test(content) && /macos/i.test(content)) {
      stats.hasMultiOs = true;
    }
    if (/nx affected|nx-set-shas/i.test(content)) {
      stats.hasNxAffected = true;
    }

    for (const match of content.matchAll(USES_LINE)) {
      const ref = match[1]?.trim() ?? '';
      if (SHA_PIN.test(ref)) stats.shaPins += 1;
      else if (VERSION_PIN.test(ref)) stats.versionPins += 1;
    }
  }

  return stats;
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const stats = await analyzeWorkflows(root);
    const ciPresent = stats.files.length > 0;
    const totalPins = stats.shaPins + stats.versionPins;
    const allUsesPinned =
      totalPins > 0 &&
      stats.contents.every((content) => {
        const uses = [...content.matchAll(USES_LINE)].map((m) => m[1]?.trim() ?? '');
        return uses.length === 0 || uses.every((ref) => /@/.test(ref) || ref.startsWith('./'));
      });
    const forkSafe =
      stats.hasForkWorkflow ||
      (stats.hasPullRequestTarget && stats.contents.some((c) => /no secrets|fork/i.test(c)));

    return [
      binary(
        'ci-present',
        ciPresent,
        `${stats.files.length} workflow(s)`,
        'missing — add .github/workflows',
        ciPresent ? undefined : 'add GitHub Actions workflows',
      ),
      {
        slug: 'actions-pinned',
        value: allUsesPinned ? 0 : 1,
        score: !ciPresent ? 0 : allUsesPinned ? 1 : 0,
        displayValue: !ciPresent
          ? 'no workflows'
          : allUsesPinned
            ? `${stats.shaPins} SHA, ${stats.versionPins} version pins`
            : 'unpinned actions — pin to SHA or version tag',
      },
      binary(
        'dependency-scanning-in-ci',
        stats.hasDepScan,
        'dependency scanning in CI',
        'missing — add dependency review or audit',
      ),
      binary(
        'fork-safe-workflows',
        forkSafe,
        'fork PRs handled separately',
        'missing — add code-pushup-fork.yml or fork-safe pull_request_target',
      ),
      binary(
        'minimal-permissions',
        stats.hasPermissions || stats.files.every((f) => f.includes('fork')),
        'workflows declare permissions',
        'missing — add permissions: to workflows',
      ),
      binary(
        'release-concurrency',
        stats.hasReleaseConcurrency,
        'release/publish use concurrency',
        'missing — add concurrency to release.yml and publish.yml',
      ),
      binary(
        'multi-os-ci',
        stats.hasMultiOs,
        'CI matrix includes ubuntu, windows, macos',
        'missing — add matrix.os with 3 platforms',
      ),
      binary(
        'nx-affected-ci',
        stats.hasNxAffected,
        'Nx affected or nx-set-shas in CI',
        'missing — add nrwl/nx-set-shas or nx affected',
      ),
      binary(
        'dependency-review-workflow',
        stats.hasDependencyReview,
        'dependency-review.yml present',
        'missing — add dependency-review workflow',
      ),
    ];
  };
}
