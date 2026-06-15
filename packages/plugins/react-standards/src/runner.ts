import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { readJsonFile } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type RunnerOptions = {
  packageJsonPath?: string;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  bundlesize?: unknown;
};

function allDeps(pkg: PackageJson): Record<string, string> {
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

function hasDep(pkg: PackageJson, name: string): boolean {
  return name in allDeps(pkg);
}

function parseMajor(version: string): number {
  const match = version.match(/(\d+)/);
  return match ? Number.parseInt(match[1]!, 10) : 0;
}

function check(
  slug: string,
  present: boolean,
  okLabel: string,
  failLabel: string,
  file: string,
): AuditOutput {
  return {
    slug,
    value: present ? 0 : 1,
    score: present ? 1 : 0,
    displayValue: present ? okLabel : failLabel,
    details: present
      ? undefined
      : {
          issues: [
            {
              message: failLabel,
              severity: 'warning',
              source: { file, position: { startLine: 1 } },
            },
          ],
        },
  };
}

async function hasBundleBudget(root: string, pkg: PackageJson): Promise<boolean> {
  if (pkg.bundlesize != null) return true;

  const viteConfigs = ['vite.config.ts', 'vite.config.js', 'vite.config.mts'];
  for (const name of viteConfigs) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    const content = await readFile(path, 'utf8');
    if (/chunkSizeWarningLimit|rollupOptions|budget/i.test(content)) return true;
  }
  return false;
}

export function createRunner(options: RunnerOptions = {}) {
  const packageJsonPath = options.packageJsonPath ?? 'package.json';
  const root = packageJsonPath === 'package.json' ? '.' : join(packageJsonPath, '..');

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    if (!existsSync(packageJsonPath)) {
      const missing = (slug: string, hint: string): AuditOutput =>
        check(slug, false, 'present', `missing — ${hint}`, packageJsonPath);
      return [
        missing('react-version', 'add react >= 19'),
        missing('recommended-state-libs', 'add @tanstack/react-query or zustand'),
        missing('hooks-rules', 'add eslint-plugin-react-hooks'),
        missing('forms-validation', 'add react-hook-form and zod'),
        {
          slug: 'bundle-size',
          value: 0,
          score: 0,
          displayValue: 'informational — no package.json',
        },
        {
          slug: 'accessibility',
          value: 0,
          score: 0,
          displayValue: 'informational — no package.json',
        },
      ];
    }

    const pkg = await readJsonFile<PackageJson>(packageJsonPath);
    const reactVersion = allDeps(pkg).react ?? '';
    const reactOk = parseMajor(reactVersion) >= 19;
    const stateOk = hasDep(pkg, '@tanstack/react-query') || hasDep(pkg, 'zustand');
    const hooksOk = hasDep(pkg, 'eslint-plugin-react-hooks');
    const formsOk = hasDep(pkg, 'react-hook-form') && hasDep(pkg, 'zod');
    const bundleOk = await hasBundleBudget(root, pkg);
    const a11yOk =
      hasDep(pkg, '@code-pushup/axe-plugin') ||
      hasDep(pkg, 'eslint-plugin-jsx-a11y') ||
      hasDep(pkg, '@axe-core/playwright');

    return [
      {
        slug: 'react-version',
        value: reactOk ? 0 : 1,
        score: reactOk ? 1 : 0,
        displayValue: reactOk
          ? `react ${reactVersion}`
          : `react ${reactVersion || 'missing'} — upgrade to 19+`,
        details: reactOk
          ? undefined
          : {
              issues: [
                {
                  message: 'upgrade to React 19 for latest patterns',
                  severity: 'warning',
                  source: { file: packageJsonPath, position: { startLine: 1 } },
                },
              ],
            },
      },
      check(
        'recommended-state-libs',
        stateOk,
        'TanStack Query or Zustand present',
        'missing — add @tanstack/react-query or zustand',
        packageJsonPath,
      ),
      check(
        'hooks-rules',
        hooksOk,
        'eslint-plugin-react-hooks present',
        'missing — add eslint-plugin-react-hooks',
        packageJsonPath,
      ),
      check(
        'forms-validation',
        formsOk,
        'react-hook-form + zod present',
        'missing — add react-hook-form and zod',
        packageJsonPath,
      ),
      {
        slug: 'bundle-size',
        value: bundleOk ? 0 : 1,
        score: bundleOk ? 1 : 0,
        displayValue: bundleOk
          ? 'bundle budget configured'
          : 'informational — no bundle size budget',
        details: bundleOk
          ? undefined
          : {
              issues: [
                {
                  message:
                    'informational: set bundlesize in package.json or chunk limits in vite.config (weight 0 in presets)',
                  severity: 'info',
                },
              ],
            },
      },
      {
        slug: 'accessibility',
        value: a11yOk ? 0 : 1,
        score: a11yOk ? 1 : 0,
        displayValue: a11yOk
          ? 'a11y tooling present'
          : 'informational — add eslint-plugin-jsx-a11y or axe-plugin',
        details: a11yOk
          ? undefined
          : {
              issues: [
                {
                  message:
                    'informational: add eslint-plugin-jsx-a11y or @code-pushup/axe-plugin (weight 0 in presets)',
                  severity: 'info',
                },
              ],
            },
      },
    ];
  };
}
