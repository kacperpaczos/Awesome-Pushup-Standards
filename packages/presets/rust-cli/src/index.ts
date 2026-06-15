import type { CoreConfig } from '@code-pushup/models';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import rustModules from '@awesome-pushup-standards/rust-modules';
import rustQuality from '@awesome-pushup-standards/rust-quality';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = { rootDir?: string };

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const [quality, modules, security, docs] = await Promise.all([
    rustQuality({ cwd: rootDir }),
    rustModules({ rootDir }),
    securitySast({ rootDir }),
    docsQuality({ rootDir }),
  ]);

  return {
    plugins: [quality, modules, security, docs],
    categories: [
      {
        slug: 'code-quality',
        title: 'Code quality',
        refs: [
          { type: 'audit', plugin: 'rust-quality', slug: 'clippy-warnings', weight: 50 },
          { type: 'audit', plugin: 'rust-quality', slug: 'format-check', weight: 20 },
          { type: 'audit', plugin: 'rust-quality', slug: 'coverage', weight: 30 },
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
            weight: 100,
          },
        ],
      },
      {
        slug: 'architecture',
        title: 'Architecture',
        refs: [
          { type: 'audit', plugin: 'rust-modules', slug: 'module-cycles', weight: 50 },
          { type: 'audit', plugin: 'rust-modules', slug: 'banned-dependencies', weight: 50 },
        ],
      },
    ],
  };
}

export default create;
