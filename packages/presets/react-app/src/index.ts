import type { CategoryConfig, CoreConfig, PluginConfig } from '@code-pushup/models';
import axePlugin from '@code-pushup/axe-plugin';
import coveragePlugin from '@code-pushup/coverage-plugin';
import eslintPlugin from '@code-pushup/eslint-plugin';
import typescriptPlugin from '@code-pushup/typescript-plugin';
import architectureRules from '@awesome-pushup-standards/architecture-rules';
import reactStandards from '@awesome-pushup-standards/react-standards';
import securitySast from '@awesome-pushup-standards/security-sast';
import tsStackDetector from '@awesome-pushup-standards/ts-stack-detector';

export type Options = {
  rootDir?: string;
  eslintPatterns?: string[];
  tsconfigPath?: string;
  coverageReport?: string;
  axeUrl?: string;
};

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';

  const [eslint, typescript, coverage, tsStack, security, react, architecture] = await Promise.all([
    eslintPlugin({
      eslintrc: `${rootDir}/eslint.config.js`,
      patterns: options.eslintPatterns ?? [`${rootDir}/src/**/*.{ts,tsx}`],
    }),
    typescriptPlugin({
      tsconfig: options.tsconfigPath ?? `${rootDir}/tsconfig.json`,
    }),
    coveragePlugin({
      reports: [options.coverageReport ?? `${rootDir}/coverage/lcov.info`],
    }),
    tsStackDetector({ packageJsonPath: `${rootDir}/package.json` }),
    securitySast({ rootDir }),
    reactStandards({ packageJsonPath: `${rootDir}/package.json` }),
    architectureRules({ rootDir, godModuleImportThreshold: 15 }),
  ]);

  const plugins: PluginConfig[] = [
    eslint,
    typescript,
    coverage,
    tsStack,
    security,
    react,
    architecture,
  ];

  const categories: CategoryConfig[] = [
    {
      slug: 'bug-prevention',
      title: 'Bug prevention',
      refs: [{ type: 'group', plugin: 'eslint', slug: 'problems', weight: 100 }],
    },
    {
      slug: 'code-style',
      title: 'Code style',
      refs: [
        { type: 'group', plugin: 'eslint', slug: 'suggestions', weight: 75 },
        { type: 'group', plugin: 'eslint', slug: 'formatting', weight: 25 },
      ],
    },
    {
      slug: 'type-safety',
      title: 'Type safety',
      refs: [
        {
          type: 'audit',
          plugin: 'typescript',
          slug: 'semantic-errors',
          weight: 100,
        },
      ],
    },
    {
      slug: 'react-best-practices',
      title: 'React best practices',
      refs: [
        {
          type: 'audit',
          plugin: 'react-standards',
          slug: 'hooks-rules',
          weight: 40,
        },
        {
          type: 'audit',
          plugin: 'react-standards',
          slug: 'recommended-state-libs',
          weight: 30,
        },
        {
          type: 'audit',
          plugin: 'react-standards',
          slug: 'bundle-size',
          weight: 30,
        },
      ],
    },
    {
      slug: 'quality-leaps',
      title: 'Quality leaps',
      refs: [
        {
          type: 'audit',
          plugin: 'ts-stack-detector',
          slug: 'suggest-typescript',
          weight: 34,
        },
        {
          type: 'audit',
          plugin: 'ts-stack-detector',
          slug: 'suggest-zod',
          weight: 33,
        },
        {
          type: 'audit',
          plugin: 'ts-stack-detector',
          slug: 'suggest-eslint',
          weight: 33,
        },
      ],
    },
  ];

  if (options.axeUrl) {
    const axe = axePlugin(options.axeUrl, { timeout: 5000 });
    plugins.push(axe);
    categories.splice(3, 0, {
      slug: 'accessibility',
      title: 'Accessibility',
      refs: [
        {
          type: 'group',
          plugin: 'axe',
          slug: 'wcag21-level-aa',
          weight: 100,
        },
      ],
    });
  }

  return { plugins, categories };
}

export default create;
