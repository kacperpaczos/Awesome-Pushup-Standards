import type { CoreConfig } from '@code-pushup/models';
import cppQuality from '@awesome-pushup-standards/cpp-quality';
import dockerQuality from '@awesome-pushup-standards/docker-quality';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import qtQuality from '@awesome-pushup-standards/qt-quality';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = {
  rootDir?: string;
  includeDocker?: boolean;
};

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const includeDocker = options.includeDocker ?? true;

  const [cpp, qt, security, docs] = await Promise.all([
    cppQuality({ cwd: rootDir }),
    qtQuality({ rootDir }),
    securitySast({ rootDir }),
    docsQuality({ rootDir }),
  ]);

  const plugins = [cpp, qt, security, docs];
  if (includeDocker) {
    plugins.push(await dockerQuality({ rootDir }));
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
            weight: 40,
          },
          { type: 'audit', plugin: 'cpp-quality', slug: 'cppcheck-issues', weight: 40 },
          {
            type: 'audit',
            plugin: 'cpp-quality',
            slug: 'format-violations',
            weight: 20,
          },
        ],
      },
      {
        slug: 'qt-correctness',
        title: 'Qt correctness',
        refs: [
          { type: 'audit', plugin: 'qt-quality', slug: 'clazy-warnings', weight: 70 },
          { type: 'audit', plugin: 'qt-quality', slug: 'qt-api-misuse', weight: 30 },
        ],
      },
    ],
  };
}

export default create;
