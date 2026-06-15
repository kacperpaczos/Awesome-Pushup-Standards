import type { CoreConfig } from '@code-pushup/models';
import cppQuality from '@awesome-pushup-standards/cpp-quality';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import gtkStyle from '@awesome-pushup-standards/gtk-style';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = {
  rootDir?: string;
  sourceDir?: string;
};

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const sourceDir = options.sourceDir ?? 'src/';

  const [cpp, gtk, security, docs] = await Promise.all([
    cppQuality({ cwd: rootDir }),
    gtkStyle({ rootDir, sourceDir }),
    securitySast({ rootDir }),
    docsQuality({ rootDir }),
  ]);

  return {
    plugins: [cpp, gtk, security, docs],
    categories: [
      {
        slug: 'code-quality',
        title: 'Code quality',
        refs: [
          { type: 'audit', plugin: 'cpp-quality', slug: 'cppcheck-issues', weight: 50 },
          {
            type: 'audit',
            plugin: 'cpp-quality',
            slug: 'format-violations',
            weight: 50,
          },
        ],
      },
      {
        slug: 'gtk-conventions',
        title: 'GTK conventions',
        refs: [
          { type: 'audit', plugin: 'gtk-style', slug: 'gobject-macros', weight: 40 },
          {
            type: 'audit',
            plugin: 'gtk-style',
            slug: 'availability-annotations',
            weight: 30,
          },
          {
            type: 'audit',
            plugin: 'gtk-style',
            slug: 'style-consistency',
            weight: 30,
          },
        ],
      },
    ],
  };
}

export default create;
