/**
 * Curated metadata for the plugins catalog overview page.
 * Edit when adding a plugin or changing human-readable descriptions.
 *
 * Audits are auto-extracted from src/audits.ts during docs:sync.
 */

/** @typedef {'heuristic' | 'wrapper' | 'hybrid'} PluginKind */

/**
 * @typedef {Object} SuggestEntry
 * @property {string} checks
 * @property {string} tooling
 * @property {string[]} relatedPlugins
 */

/**
 * @typedef {Object} PluginMeta
 * @property {PluginKind} kind
 * @property {string} detects
 * @property {string[]} externalTools
 * @property {Record<string, string>} configOptions
 * @property {Record<string, SuggestEntry>} [suggests]
 */

/** @type {Record<string, PluginMeta>} */
export const PLUGIN_CATALOG_META = {
  'api-openapi': {
    kind: 'hybrid',
    detects:
      'OpenAPI spec files, Spectral lint results, API versioning, and schema-first design signals',
    externalTools: ['spectral'],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'architecture-rules': {
    kind: 'hybrid',
    detects:
      'Forbidden imports, circular dependencies, and god modules via dependency-cruiser / import-linter',
    externalTools: ['dependency-cruiser', 'import-linter'],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
      godModuleImportThreshold:
        'Import count threshold for god-module audit (default: varies by preset)',
    },
  },
  'cicd-quality': {
    kind: 'heuristic',
    detects:
      'GitHub Actions workflows — CI presence, pinned actions, multi-OS matrix, nx affected, dependency review',
    externalTools: [],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'contributor-hygiene': {
    kind: 'heuristic',
    detects:
      'Conventional commits, husky, prettier, knip, and related contributor tooling in the repo',
    externalTools: ['knip'],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'cpp-quality': {
    kind: 'wrapper',
    detects: 'C/C++ sources and runs clang-tidy / cppcheck when installed',
    externalTools: ['clang-tidy', 'cppcheck'],
    configOptions: {
      cwd: 'Working directory (default: `.`)',
    },
  },
  'docker-quality': {
    kind: 'hybrid',
    detects: 'Dockerfiles (hadolint), multi-stage builds, and image vulnerability scanning in CI',
    externalTools: ['hadolint', 'trivy', 'grype'],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'docs-quality': {
    kind: 'heuristic',
    detects: 'README completeness, LICENSE, CONTRIBUTING, and other documentation files',
    externalTools: [],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'error-logging': {
    kind: 'heuristic',
    detects: 'Bare except clauses, structured logging setup, and console.log debug in source',
    externalTools: [],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'gtk-style': {
    kind: 'heuristic',
    detects: 'GTK/GNOME C source patterns — GObject style, signal usage, and related conventions',
    externalTools: [],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
      sourceDir: 'Source directory override (optional)',
    },
  },
  'llm-review': {
    kind: 'hybrid',
    detects:
      'Optional LLM rubric review for architecture, naming, and consistency (skips when not configured)',
    externalTools: [],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
      sourceDir: 'Source directory override (optional)',
    },
  },
  'python-quality': {
    kind: 'wrapper',
    detects:
      'Python project and runs ruff, mypy/ty, coverage, bandit, and pip-audit when installed',
    externalTools: ['ruff', 'mypy', 'ty', 'bandit', 'pip-audit', 'pytest-cov'],
    configOptions: {
      cwd: 'Working directory (default: `.`)',
    },
  },
  'python-stack-detector': {
    kind: 'heuristic',
    detects: 'Python stack tooling references in `pyproject.toml`',
    externalTools: [],
    configOptions: {
      pyprojectPath: 'Path to pyproject.toml (default: `pyproject.toml`)',
    },
    suggests: {
      'has-pydantic': {
        checks: '`pydantic` in dependencies',
        tooling: 'pydantic runtime validation',
        relatedPlugins: ['python-quality'],
      },
      'has-type-checker': {
        checks: '`[tool.mypy]` section or `ty` configured',
        tooling: 'mypy or ty',
        relatedPlugins: ['python-quality'],
      },
      'has-ruff': {
        checks: '`[tool.ruff]` section',
        tooling: 'ruff lint and format',
        relatedPlugins: ['python-quality'],
      },
      'has-security-tooling': {
        checks: 'bandit or pip-audit referenced',
        tooling: 'bandit, pip-audit',
        relatedPlugins: ['python-quality', 'security-sast'],
      },
    },
  },
  'qt-quality': {
    kind: 'hybrid',
    detects: 'Qt CMake projects — clazy configuration, Qt API usage, optional clazy on PATH',
    externalTools: ['clazy'],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'react-standards': {
    kind: 'heuristic',
    detects:
      'React 19 patterns in package.json and Vite config — state management, hooks, forms, bundle budget, a11y',
    externalTools: ['eslint-plugin-react-hooks', 'axe'],
    configOptions: {
      packageJsonPath: 'Path to package.json (default: `package.json`)',
    },
  },
  'release-quality': {
    kind: 'heuristic',
    detects: 'Release hygiene — OIDC npm publish, changesets, and related release configuration',
    externalTools: [],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'rust-modules': {
    kind: 'heuristic',
    detects:
      'Rust crate layout — module structure, public API surface, and binary crate conventions',
    externalTools: [],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'rust-quality': {
    kind: 'wrapper',
    detects:
      'Rust workspace and runs cargo clippy, rustfmt, cargo audit, and cargo tarpaulin when installed',
    externalTools: ['cargo clippy', 'rustfmt', 'cargo audit', 'cargo tarpaulin'],
    configOptions: {
      cwd: 'Working directory (default: `.`)',
    },
  },
  'security-sast': {
    kind: 'hybrid',
    detects:
      'Secrets scanning config, dependency audit (npm/pip/cargo), SAST tooling, and SBOM generation in CI',
    externalTools: ['gitleaks', 'npm audit', 'pip-audit', 'cargo audit', 'syft'],
    configOptions: {
      rootDir: 'Project root (default: `.`)',
    },
  },
  'ts-stack-detector': {
    kind: 'heuristic',
    detects: 'TypeScript, ESLint, and Zod setup in `package.json` and optionally `src/`',
    externalTools: [],
    configOptions: {
      packageJsonPath: 'Path to package.json (default: `package.json`)',
      scanSource: 'Scan `src/` for form/API patterns that imply Zod need (default: `true`)',
    },
    suggests: {
      'suggest-typescript': {
        checks: '`typescript` in dependencies',
        tooling: 'TypeScript compiler',
        relatedPlugins: ['@code-pushup/typescript-plugin'],
      },
      'suggest-eslint': {
        checks: '`eslint` in dependencies',
        tooling: 'ESLint',
        relatedPlugins: ['@code-pushup/eslint-plugin'],
      },
      'suggest-zod': {
        checks: '`zod` in dependencies, or not needed for detected form/API patterns',
        tooling: 'Zod runtime validation',
        relatedPlugins: ['react-standards', '@code-pushup/typescript-plugin'],
      },
    },
  },
};

/** Display names for official @code-pushup plugins parsed from preset imports. */
export const OFFICIAL_PLUGIN_LABELS = {
  'axe-plugin': 'axe (`@code-pushup/axe-plugin`)',
  'coverage-plugin': 'coverage (`@code-pushup/coverage-plugin`)',
  'eslint-plugin': 'eslint (`@code-pushup/eslint-plugin`)',
  'typescript-plugin': 'typescript (`@code-pushup/typescript-plugin`)',
};
