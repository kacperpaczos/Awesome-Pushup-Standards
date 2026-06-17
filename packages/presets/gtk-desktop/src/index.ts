import type { CoreConfig } from '@code-pushup/models';
import { presetWeight, type AuditRigor } from '@awesome-pushup-standards/audit-contract';
import cppQuality from '@awesome-pushup-standards/cpp-quality';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import gtkStyle from '@awesome-pushup-standards/gtk-style';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = {
  rootDir?: string;
  sourceDir?: string;
  rigor?: AuditRigor;
};

const DEFAULT_RIGOR: AuditRigor = 'base';

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const sourceDir = options.sourceDir ?? 'src/';
  const rigor = options.rigor ?? DEFAULT_RIGOR;
  const w = (weight: number, toolDependent = false) => presetWeight(weight, rigor, toolDependent);

  const [cpp, gtk, security, docs] = await Promise.all([
    cppQuality({ cwd: rootDir, rigor }),
    gtkStyle({ rootDir, sourceDir }),
    securitySast({ rootDir, rigor }),
    docsQuality({ rootDir }),
  ]);

  return {
    plugins: [cpp, gtk, security, docs],
    categories: [
      {
        slug: 'code-quality',
        title: 'Code quality',
        refs: [
          { type: 'audit', plugin: 'cpp-quality', slug: 'cppcheck-issues', weight: w(50, true) },
          {
            type: 'audit',
            plugin: 'cpp-quality',
            slug: 'format-violations',
            weight: w(50, true),
          },
        ],
      },
      {
        slug: 'gtk-conventions',
        title: 'GTK conventions',
        refs: [
          { type: 'audit', plugin: 'gtk-style', slug: 'gobject-macros', weight: w(40) },
          {
            type: 'audit',
            plugin: 'gtk-style',
            slug: 'availability-annotations',
            weight: w(30),
          },
          {
            type: 'audit',
            plugin: 'gtk-style',
            slug: 'style-consistency',
            weight: w(30),
          },
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
    ],
  };
}

export default create;
