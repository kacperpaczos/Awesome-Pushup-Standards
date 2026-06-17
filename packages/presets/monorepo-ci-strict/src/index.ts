import type { CoreConfig } from '@code-pushup/models';
import { presetWeight, type AuditRigor } from '@awesome-pushup-standards/audit-contract';
import cicdQuality from '@awesome-pushup-standards/cicd-quality';
import contributorHygiene from '@awesome-pushup-standards/contributor-hygiene';
import docsQuality from '@awesome-pushup-standards/docs-quality';
import releaseQuality from '@awesome-pushup-standards/release-quality';
import securitySast from '@awesome-pushup-standards/security-sast';

export type Options = {
  rootDir?: string;
  rigor?: AuditRigor;
};

const DEFAULT_RIGOR: AuditRigor = 'strict';

export async function create(options: Options = {}): Promise<CoreConfig> {
  const rootDir = options.rootDir ?? '.';
  const rigor = options.rigor ?? DEFAULT_RIGOR;
  const w = (weight: number, toolDependent = false) => presetWeight(weight, rigor, toolDependent);

  const [cicd, contributor, release, docs, security] = await Promise.all([
    cicdQuality({ rootDir }),
    contributorHygiene({ rootDir }),
    releaseQuality({ rootDir }),
    docsQuality({ rootDir }),
    securitySast({ rootDir, rigor }),
  ]);

  return {
    plugins: [cicd, contributor, release, docs, security],
    categories: [
      {
        slug: 'ci-cd',
        title: 'CI/CD',
        refs: [
          { type: 'audit', plugin: 'cicd-quality', slug: 'ci-present', weight: w(20) },
          { type: 'audit', plugin: 'cicd-quality', slug: 'actions-pinned', weight: w(10) },
          { type: 'audit', plugin: 'cicd-quality', slug: 'multi-os-ci', weight: w(15) },
          { type: 'audit', plugin: 'cicd-quality', slug: 'nx-affected-ci', weight: w(15) },
          {
            type: 'audit',
            plugin: 'cicd-quality',
            slug: 'dependency-review-workflow',
            weight: w(10),
          },
        ],
      },
      {
        slug: 'release-security',
        title: 'Release & security',
        refs: [
          { type: 'audit', plugin: 'release-quality', slug: 'npm-oidc-publish', weight: w(15) },
          {
            type: 'audit',
            plugin: 'release-quality',
            slug: 'separated-release-publish',
            weight: w(10),
          },
          { type: 'audit', plugin: 'cicd-quality', slug: 'fork-safe-workflows', weight: w(10) },
          { type: 'audit', plugin: 'cicd-quality', slug: 'minimal-permissions', weight: w(5) },
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
            weight: w(15),
          },
          {
            type: 'audit',
            plugin: 'contributor-hygiene',
            slug: 'pre-commit-hooks',
            weight: w(10),
          },
          {
            type: 'audit',
            plugin: 'contributor-hygiene',
            slug: 'commitizen-configured',
            weight: w(5),
          },
        ],
      },
      {
        slug: 'documentation',
        title: 'Documentation',
        refs: [
          { type: 'audit', plugin: 'docs-quality', slug: 'readme-completeness', weight: w(10) },
          { type: 'audit', plugin: 'release-quality', slug: 'security-policy', weight: w(5) },
          { type: 'audit', plugin: 'docs-quality', slug: 'has-contributing', weight: w(5) },
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
            weight: w(4),
          },
          { type: 'audit', plugin: 'release-quality', slug: 'pkg-preview-on-pr', weight: w(3) },
          { type: 'audit', plugin: 'release-quality', slug: 'release-environment', weight: w(3) },
        ],
      },
    ],
  };
}

export default create;
