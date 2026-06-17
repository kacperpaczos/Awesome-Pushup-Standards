import type { CoreConfig } from '@code-pushup/models';
import { presetWeight, type AuditRigor } from '@awesome-pushup-standards/audit-contract';
import apiOpenapi from '@awesome-pushup-standards/api-openapi';
import architectureRules from '@awesome-pushup-standards/architecture-rules';
import dockerQuality from '@awesome-pushup-standards/docker-quality';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import pythonQuality from '@awesome-pushup-standards/python-quality';
import pythonStackDetector from '@awesome-pushup-standards/python-stack-detector';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = {
  rootDir?: string;
  pyprojectPath?: string;
  includeDocker?: boolean;
  rigor?: AuditRigor;
};

const DEFAULT_RIGOR: AuditRigor = 'strict';

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const pyprojectPath = options.pyprojectPath ?? 'pyproject.toml';
  const includeDocker = options.includeDocker ?? true;
  const rigor = options.rigor ?? DEFAULT_RIGOR;
  const w = (weight: number, toolDependent = false) => presetWeight(weight, rigor, toolDependent);

  const [stack, quality, architecture, api, security, docs] = await Promise.all([
    pythonStackDetector({ pyprojectPath }),
    pythonQuality({ cwd: rootDir, rigor }),
    architectureRules({ rootDir }),
    apiOpenapi({ rootDir, rigor }),
    securitySast({ rootDir, rigor }),
    docsQuality({ rootDir }),
  ]);

  const plugins = [quality, stack, architecture, api, security, docs];
  if (includeDocker) {
    plugins.push(await dockerQuality({ rootDir, rigor }));
  }

  return {
    plugins,
    categories: [
      {
        slug: 'quality-leaps',
        title: 'Quality leaps',
        refs: [
          {
            type: 'audit',
            plugin: 'python-stack-detector',
            slug: 'has-pydantic',
            weight: w(50),
          },
          {
            type: 'audit',
            plugin: 'python-stack-detector',
            slug: 'has-type-checker',
            weight: w(50),
          },
        ],
      },
      {
        slug: 'code-quality',
        title: 'Code quality',
        refs: [
          { type: 'audit', plugin: 'python-quality', slug: 'ruff-lint', weight: w(40, true) },
          { type: 'audit', plugin: 'python-quality', slug: 'type-errors', weight: w(40, true) },
          { type: 'audit', plugin: 'python-quality', slug: 'line-coverage', weight: w(20, true) },
        ],
      },
      {
        slug: 'security',
        title: 'Security',
        refs: [
          { type: 'audit', plugin: 'python-quality', slug: 'bandit-findings', weight: w(30, true) },
          {
            type: 'audit',
            plugin: 'python-quality',
            slug: 'dependency-vulnerabilities',
            weight: w(20, true),
          },
          { type: 'audit', plugin: 'security-sast', slug: 'dependency-audit', weight: w(25, true) },
          { type: 'audit', plugin: 'security-sast', slug: 'sast-findings', weight: w(15) },
          { type: 'audit', plugin: 'security-sast', slug: 'secrets-detected', weight: w(10) },
        ],
      },
      {
        slug: 'architecture',
        title: 'Architecture',
        refs: [
          {
            type: 'audit',
            plugin: 'architecture-rules',
            slug: 'forbidden-imports',
            weight: w(50),
          },
          {
            type: 'audit',
            plugin: 'architecture-rules',
            slug: 'circular-dependencies',
            weight: w(50),
          },
        ],
      },
      {
        slug: 'api-design',
        title: 'API design',
        refs: [
          {
            type: 'audit',
            plugin: 'api-openapi',
            slug: 'spectral-violations',
            weight: w(60, true),
          },
          {
            type: 'audit',
            plugin: 'api-openapi',
            slug: 'has-openapi-spec',
            weight: w(40),
          },
        ],
      },
      {
        slug: 'documentation',
        title: 'Documentation',
        refs: [
          {
            type: 'audit',
            plugin: 'docs-quality',
            slug: 'readme-completeness',
            weight: w(50),
          },
          { type: 'audit', plugin: 'docs-quality', slug: 'has-license', weight: w(50) },
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
