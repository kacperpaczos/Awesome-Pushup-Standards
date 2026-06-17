import type { CoreConfig } from '@code-pushup/models';
import { presetWeight, type AuditRigor } from '@awesome-pushup-standards/audit-contract';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import rustModules from '@awesome-pushup-standards/rust-modules';
import rustQuality from '@awesome-pushup-standards/rust-quality';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = { rootDir?: string; rigor?: AuditRigor };

const DEFAULT_RIGOR: AuditRigor = 'base';

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const rigor = options.rigor ?? DEFAULT_RIGOR;
  const w = (weight: number, toolDependent = false) => presetWeight(weight, rigor, toolDependent);

  const [quality, modules, security, docs] = await Promise.all([
    rustQuality({ cwd: rootDir, rigor }),
    rustModules({ rootDir, rigor }),
    securitySast({ rootDir, rigor }),
    docsQuality({ rootDir }),
  ]);

  return {
    plugins: [quality, modules, security, docs],
    categories: [
      {
        slug: 'code-quality',
        title: 'Code quality',
        refs: [
          { type: 'audit', plugin: 'rust-quality', slug: 'clippy-warnings', weight: w(50, true) },
          { type: 'audit', plugin: 'rust-quality', slug: 'format-check', weight: w(20, true) },
          { type: 'audit', plugin: 'rust-quality', slug: 'coverage', weight: w(30, true) },
        ],
      },
      {
        slug: 'security',
        title: 'Security',
        refs: [
          {
            type: 'audit',
            plugin: 'rust-quality',
            slug: 'advisory-vulnerabilities',
            weight: w(50, true),
          },
          { type: 'audit', plugin: 'security-sast', slug: 'secrets-detected', weight: w(20) },
          {
            type: 'audit',
            plugin: 'security-sast',
            slug: 'dependency-audit',
            weight: w(20, true),
          },
          { type: 'audit', plugin: 'security-sast', slug: 'sast-findings', weight: w(10) },
        ],
      },
      {
        slug: 'documentation',
        title: 'Documentation',
        refs: [
          { type: 'audit', plugin: 'docs-quality', slug: 'readme-completeness', weight: w(40) },
          { type: 'audit', plugin: 'docs-quality', slug: 'has-changelog', weight: w(30) },
          { type: 'audit', plugin: 'docs-quality', slug: 'has-license', weight: w(20) },
          { type: 'audit', plugin: 'docs-quality', slug: 'has-contributing', weight: w(10) },
        ],
      },
      {
        slug: 'architecture',
        title: 'Architecture',
        refs: [
          { type: 'audit', plugin: 'rust-modules', slug: 'module-cycles', weight: w(50, true) },
          {
            type: 'audit',
            plugin: 'rust-modules',
            slug: 'banned-dependencies',
            weight: w(50, true),
          },
        ],
      },
    ],
  };
}

export default create;
