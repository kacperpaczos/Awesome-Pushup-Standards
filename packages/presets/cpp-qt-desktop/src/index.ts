import type { CoreConfig } from '@code-pushup/models';
import { presetWeight, type AuditRigor } from '@awesome-pushup-standards/audit-contract';
import cppQuality from '@awesome-pushup-standards/cpp-quality';
import dockerQuality from '@awesome-pushup-standards/docker-quality';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import qtQuality from '@awesome-pushup-standards/qt-quality';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = {
  rootDir?: string;
  includeDocker?: boolean;
  rigor?: AuditRigor;
};

const DEFAULT_RIGOR: AuditRigor = 'base';

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const includeDocker = options.includeDocker ?? true;
  const rigor = options.rigor ?? DEFAULT_RIGOR;
  const w = (weight: number, toolDependent = false) => presetWeight(weight, rigor, toolDependent);

  const [cpp, qt, security, docs] = await Promise.all([
    cppQuality({ cwd: rootDir, rigor }),
    qtQuality({ rootDir, rigor }),
    securitySast({ rootDir, rigor }),
    docsQuality({ rootDir }),
  ]);

  const plugins = [cpp, qt, security, docs];
  if (includeDocker) {
    plugins.push(await dockerQuality({ rootDir, rigor }));
  }

  return {
    plugins,
    categories: [
      {
        slug: 'code-quality',
        title: 'Code quality',
        refs: [
          {
            type: 'audit',
            plugin: 'cpp-quality',
            slug: 'clang-tidy-warnings',
            weight: w(40, true),
          },
          { type: 'audit', plugin: 'cpp-quality', slug: 'cppcheck-issues', weight: w(40, true) },
          {
            type: 'audit',
            plugin: 'cpp-quality',
            slug: 'format-violations',
            weight: w(20, true),
          },
        ],
      },
      {
        slug: 'qt-correctness',
        title: 'Qt correctness',
        refs: [
          { type: 'audit', plugin: 'qt-quality', slug: 'clazy-warnings', weight: w(70, true) },
          { type: 'audit', plugin: 'qt-quality', slug: 'qt-api-misuse', weight: w(30) },
        ],
      },
      {
        slug: 'security',
        title: 'Security',
        refs: [
          { type: 'audit', plugin: 'security-sast', slug: 'secrets-detected', weight: w(20) },
          { type: 'audit', plugin: 'security-sast', slug: 'dependency-audit', weight: w(50, true) },
          { type: 'audit', plugin: 'security-sast', slug: 'sast-findings', weight: w(30) },
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
      ...(includeDocker
        ? [
            {
              slug: 'deployment',
              title: 'Deployment',
              refs: [
                {
                  type: 'audit' as const,
                  plugin: 'docker-quality',
                  slug: 'hadolint-violations',
                  weight: w(40, true),
                },
                {
                  type: 'audit' as const,
                  plugin: 'docker-quality',
                  slug: 'multi-stage-build',
                  weight: w(30),
                },
                {
                  type: 'audit' as const,
                  plugin: 'docker-quality',
                  slug: 'image-vulnerabilities',
                  weight: w(30),
                },
              ],
            },
          ]
        : []),
    ],
  };
}

export default create;
