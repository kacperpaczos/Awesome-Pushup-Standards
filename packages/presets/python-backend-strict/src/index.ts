import type { CoreConfig } from '@code-pushup/models';
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
};

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const pyprojectPath = options.pyprojectPath ?? 'pyproject.toml';
  const includeDocker = options.includeDocker ?? true;

  const [stack, quality, architecture, api, security, docs] = await Promise.all([
    pythonStackDetector({ pyprojectPath }),
    pythonQuality({ cwd: rootDir }),
    architectureRules({ rootDir }),
    apiOpenapi({ rootDir }),
    securitySast({ rootDir }),
    docsQuality({ rootDir }),
  ]);

  const plugins = [quality, stack, architecture, api, security, docs];
  if (includeDocker) {
    plugins.push(await dockerQuality({ rootDir }));
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
            weight: 50,
          },
          {
            type: 'audit',
            plugin: 'python-stack-detector',
            slug: 'has-type-checker',
            weight: 50,
          },
        ],
      },
      {
        slug: 'code-quality',
        title: 'Code quality',
        refs: [
          { type: 'audit', plugin: 'python-quality', slug: 'ruff-lint', weight: 40 },
          { type: 'audit', plugin: 'python-quality', slug: 'type-errors', weight: 40 },
          { type: 'audit', plugin: 'python-quality', slug: 'line-coverage', weight: 20 },
        ],
      },
      {
        slug: 'security',
        title: 'Security',
        refs: [
          {
            type: 'audit',
            plugin: 'security-sast',
            slug: 'dependency-audit',
            weight: 40,
          },
          {
            type: 'audit',
            plugin: 'security-sast',
            slug: 'sast-findings',
            weight: 40,
          },
          {
            type: 'audit',
            plugin: 'security-sast',
            slug: 'secrets-detected',
            weight: 20,
          },
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
            weight: 50,
          },
          {
            type: 'audit',
            plugin: 'architecture-rules',
            slug: 'circular-dependencies',
            weight: 50,
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
            weight: 60,
          },
          {
            type: 'audit',
            plugin: 'api-openapi',
            slug: 'has-openapi-spec',
            weight: 40,
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
            weight: 50,
          },
          { type: 'audit', plugin: 'docs-quality', slug: 'has-license', weight: 50 },
        ],
      },
    ],
  };
}

export default create;
