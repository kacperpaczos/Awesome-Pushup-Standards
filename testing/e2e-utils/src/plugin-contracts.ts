import type { E2eImage } from './docker.js';
import type { ToolPreflightSpec } from './tool-preflight.js';

const NO_TOOLS: ToolPreflightSpec[] = [];
const SPECTRAL_TOOL: ToolPreflightSpec = {
  name: 'spectral',
  command: 'spectral',
  args: ['--version'],
};
const PYTHON_TOOLS: ToolPreflightSpec[] = [
  { name: 'ruff', command: 'ruff', args: ['--version'] },
  { name: 'mypy', command: 'mypy', args: ['--version'] },
  { name: 'bandit', command: 'bandit', args: ['--version'] },
  { name: 'pytest', command: 'pytest', args: ['--version'] },
];
const RUST_TOOLS: ToolPreflightSpec[] = [
  { name: 'cargo', command: 'cargo', args: ['--version'] },
  { name: 'clippy', command: 'cargo', args: ['clippy', '--version'] },
  { name: 'rustfmt', command: 'rustfmt', args: ['--version'] },
];
const CPP_TOOLS: ToolPreflightSpec[] = [
  { name: 'clang-tidy', command: 'clang-tidy', args: ['--version'] },
  { name: 'cppcheck', command: 'cppcheck', args: ['--version'] },
  { name: 'clang-format', command: 'clang-format', args: ['--version'] },
  { name: 'clazy', command: 'clazy', args: ['--version'] },
];

export type PluginContract = {
  image: E2eImage;
  tools: ToolPreflightSpec[];
  good: {
    minScore: number;
    requiredAudits: string[];
    excludeSlugs: string[];
  };
  bad:
    | {
        mode: 'failing-audit';
        failingAudit: string;
      }
    | {
        mode: 'all-skipped';
      };
};

export const PLUGIN_CONTRACTS = {
  'api-openapi': {
    image: 'e2e-node:20',
    tools: [SPECTRAL_TOOL],
    good: {
      minScore: 0.9,
      requiredAudits: ['has-openapi-spec', 'spectral-violations', 'api-versioning', 'schema-first'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'api-versioning' },
  },
  'architecture-rules': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: [
        'forbidden-imports',
        'circular-dependencies',
        'layer-violations',
        'god-module',
      ],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'forbidden-imports' },
  },
  'cicd-quality': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: [
        'ci-present',
        'actions-pinned',
        'dependency-scanning-in-ci',
        'fork-safe-workflows',
        'minimal-permissions',
        'release-concurrency',
        'multi-os-ci',
        'nx-affected-ci',
        'dependency-review-workflow',
      ],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'ci-present' },
  },
  'contributor-hygiene': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: [
        'conventional-commits',
        'pre-commit-hooks',
        'commitizen-configured',
        'editorconfig-present',
        'prettier-configured',
        'knip-configured',
        'env-example-present',
      ],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'pre-commit-hooks' },
  },
  'cpp-quality': {
    image: 'e2e-cpp:qt',
    tools: CPP_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['clang-tidy-warnings', 'cppcheck-issues', 'format-violations'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'format-violations' },
  },
  'docker-quality': {
    image: 'e2e-node:20',
    tools: [{ name: 'hadolint', command: 'hadolint', args: ['--version'] }],
    good: {
      minScore: 0.9,
      requiredAudits: ['hadolint-violations', 'multi-stage-build'],
      excludeSlugs: ['image-size', 'image-vulnerabilities'],
    },
    bad: { mode: 'failing-audit', failingAudit: 'multi-stage-build' },
  },
  'docs-quality': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['readme-completeness', 'has-changelog', 'has-license', 'has-contributing'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'readme-completeness' },
  },
  'error-logging': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['bare-except', 'structured-logging', 'no-print-debug'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'bare-except' },
  },
  'gtk-style': {
    image: 'e2e-gtk:c',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['gobject-macros', 'style-consistency'],
      excludeSlugs: ['availability-annotations'],
    },
    bad: { mode: 'failing-audit', failingAudit: 'gobject-macros' },
  },
  'llm-review': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: [
        'architecture-review',
        'naming-review',
        'consistency-review',
        'modern-alternatives',
        'readability-review',
      ],
      excludeSlugs: [],
    },
    bad: { mode: 'all-skipped' },
  },
  'python-quality': {
    image: 'e2e-python:3.12',
    tools: PYTHON_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['ruff-lint', 'type-errors', 'bandit-findings'],
      excludeSlugs: ['line-coverage', 'dependency-vulnerabilities'],
    },
    bad: { mode: 'failing-audit', failingAudit: 'ruff-lint' },
  },
  'python-stack-detector': {
    image: 'e2e-python:3.12',
    tools: PYTHON_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['has-pydantic', 'has-type-checker', 'has-ruff', 'has-security-tooling'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'has-ruff' },
  },
  'qt-quality': {
    image: 'e2e-cpp:qt',
    tools: [{ name: 'clazy', command: 'clazy', args: ['--version'] }],
    good: {
      minScore: 0.9,
      requiredAudits: ['clazy-warnings', 'qt-api-misuse'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'qt-api-misuse' },
  },
  'react-standards': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: [
        'react-version',
        'recommended-state-libs',
        'hooks-rules',
        'forms-validation',
      ],
      excludeSlugs: ['bundle-size', 'accessibility'],
    },
    bad: { mode: 'failing-audit', failingAudit: 'react-version' },
  },
  'release-quality': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: [
        'npm-oidc-publish',
        'separated-release-publish',
        'security-policy',
        'pr-commitlint',
        'pkg-preview-on-pr',
        'release-environment',
      ],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'security-policy' },
  },
  'rust-modules': {
    image: 'e2e-rust:1.83',
    tools: [
      { name: 'cargo', command: 'cargo', args: ['--version'] },
      { name: 'cargo-modules', command: 'cargo', args: ['modules', '--version'] },
      { name: 'cargo-deny', command: 'cargo-deny', args: ['--version'] },
    ],
    good: {
      minScore: 0.9,
      requiredAudits: ['module-cycles', 'banned-dependencies'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'banned-dependencies' },
  },
  'rust-quality': {
    image: 'e2e-rust:1.83',
    tools: RUST_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['clippy-warnings', 'format-check'],
      excludeSlugs: ['coverage', 'advisory-vulnerabilities'],
    },
    bad: { mode: 'failing-audit', failingAudit: 'clippy-warnings' },
  },
  'security-sast': {
    image: 'e2e-security',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['secrets-detected', 'sast-findings'],
      excludeSlugs: ['dependency-audit', 'sbom-generated'],
    },
    bad: { mode: 'failing-audit', failingAudit: 'secrets-detected' },
  },
  'ts-stack-detector': {
    image: 'e2e-node:20',
    tools: NO_TOOLS,
    good: {
      minScore: 0.9,
      requiredAudits: ['suggest-typescript', 'suggest-zod', 'suggest-eslint'],
      excludeSlugs: [],
    },
    bad: { mode: 'failing-audit', failingAudit: 'suggest-typescript' },
  },
} satisfies Record<string, PluginContract>;

export type PluginSlug = keyof typeof PLUGIN_CONTRACTS;
