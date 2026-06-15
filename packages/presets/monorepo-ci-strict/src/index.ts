import type { CoreConfig } from '@code-pushup/models';
import cicdQuality from '@awesome-pushup-standards/cicd-quality';
import contributorHygiene from '@awesome-pushup-standards/contributor-hygiene';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import releaseQuality from '@awesome-pushup-standards/release-quality';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = {
  rootDir?: string;
};

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';

  const [cicd, contributor, release, docs, security] = await Promise.all([
    cicdQuality({ rootDir }),
    contributorHygiene({ rootDir }),
    releaseQuality({ rootDir }),
    docsQuality({ rootDir }),
    securitySast({ rootDir }),
  ]);

  return {
    plugins: [cicd, contributor, release, docs, security],
    categories: [
      {
        slug: 'ci-cd',
        title: 'CI/CD',
        refs: [
          { type: 'audit', plugin: 'cicd-quality', slug: 'ci-present', weight: 20 },
          { type: 'audit', plugin: 'cicd-quality', slug: 'actions-pinned', weight: 10 },
          { type: 'audit', plugin: 'cicd-quality', slug: 'multi-os-ci', weight: 15 },
          { type: 'audit', plugin: 'cicd-quality', slug: 'nx-affected-ci', weight: 15 },
          {
            type: 'audit',
            plugin: 'cicd-quality',
            slug: 'dependency-review-workflow',
            weight: 10,
          },
        ],
      },
      {
        slug: 'release-security',
        title: 'Release & security',
        refs: [
          { type: 'audit', plugin: 'release-quality', slug: 'npm-oidc-publish', weight: 15 },
          {
            type: 'audit',
            plugin: 'release-quality',
            slug: 'separated-release-publish',
            weight: 10,
          },
          { type: 'audit', plugin: 'cicd-quality', slug: 'fork-safe-workflows', weight: 10 },
          { type: 'audit', plugin: 'cicd-quality', slug: 'minimal-permissions', weight: 5 },
        ],
      },
      {
        slug: 'contributor-experience',
        title: 'Contributor experience',
        refs: [
          {
            type: 'audit',
            plugin: 'contributor-hygiene',
            slug: 'conventional-commits',
            weight: 15,
          },
          {
            type: 'audit',
            plugin: 'contributor-hygiene',
            slug: 'pre-commit-hooks',
            weight: 10,
          },
          {
            type: 'audit',
            plugin: 'contributor-hygiene',
            slug: 'commitizen-configured',
            weight: 5,
          },
        ],
      },
      {
        slug: 'documentation',
        title: 'Documentation',
        refs: [
          { type: 'audit', plugin: 'docs-quality', slug: 'readme-completeness', weight: 10 },
          { type: 'audit', plugin: 'release-quality', slug: 'security-policy', weight: 5 },
          { type: 'audit', plugin: 'docs-quality', slug: 'has-contributing', weight: 5 },
        ],
      },
      {
        slug: 'quality-leaps',
        title: 'Quality leaps',
        refs: [
          {
            type: 'audit',
            plugin: 'contributor-hygiene',
            slug: 'knip-configured',
            weight: 4,
          },
          { type: 'audit', plugin: 'release-quality', slug: 'pkg-preview-on-pr', weight: 3 },
          { type: 'audit', plugin: 'release-quality', slug: 'release-environment', weight: 3 },
        ],
      },
    ],
  };
}

export default create;
