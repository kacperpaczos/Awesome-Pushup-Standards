---
title: Plugins catalog
description: Human-readable overview of all plugins — what they detect, audits, configuration, stack detector mappings, and preset composition.
---

Every plugin in **awesome-pushup-standards** wraps or inspects your project and returns **audits** — individual checks scored from 0 to 1. Presets bundle multiple plugins with weighted categories so you get a single scoreboard without wiring everything by hand.

## What plugins do

There are two main patterns:

| Pattern       | How it works                                                                                                      | Score when missing                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Heuristic** | Reads project files (config, source, CI workflows) and returns binary scores (0/1) for presence or absence checks | Usually `0` with a warning issue                                                                           |
| **Wrapper**   | Shells out to an external CLI (`ruff`, `clippy`, `spectral`, `hadolint`, …) and maps tool output to audits        | **Skipped** (score `1`, display value contains `"skipped"`) when the tool is not installed — never crashes |

Some plugins combine both: they inspect files for configuration signals and run a CLI when available (for example `api-openapi` with Spectral, `security-sast` with npm/pip/cargo audit).

See [Scoring model](/reference/scoring-model/) for how scores roll up into categories.

## Stack detectors explained

**Stack detectors** are heuristic plugins that answer: _“Do you have the right tooling configured for this stack?”_ They do **not** dynamically enable other plugins at runtime.

| Plugin                                                     | Scans                             | Purpose                                                                        |
| ---------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| [`python-stack-detector`](/plugins/python-stack-detector/) | `pyproject.toml`                  | Detects pydantic, mypy/ty, ruff, bandit/pip-audit references                   |
| [`ts-stack-detector`](/plugins/ts-stack-detector/)         | `package.json`, optionally `src/` | Detects TypeScript, ESLint, and Zod when forms/API validation is likely needed |

When an audit scores `0`, the plugin suggests a **quality leap** — add the missing tool or config. Presets pair stack detectors with **wrapper** plugins that actually run those tools (for example `python-quality` runs ruff and mypy; `@code-pushup/eslint-plugin` runs ESLint).

The tables below list each audit, what it checks, and which related plugins or tools typically follow.

## Presets vs individual plugins

| Approach               | When to use                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Preset**             | You want a curated bundle for a stack (`python-backend-strict`, `react-app`, `rust-cli`, …) with sensible category weights |
| **Individual plugins** | You need fine-grained control — pick only the checks you care about and set your own category weights                      |

Presets import plugins explicitly in code; changing a preset’s composition requires editing `packages/presets/<slug>/src/index.ts`. The [Preset composition](#preset-composition-auto-generated) table is generated from those imports.

## Official plugins outside this repo

The [`react-app`](/presets/react-app/) preset also uses **official code-pushup community plugins** that are not published under `@awesome-pushup-standards/`:

| npm package                      | Role                                         |
| -------------------------------- | -------------------------------------------- |
| `@code-pushup/eslint-plugin`     | ESLint problems, suggestions, formatting     |
| `@code-pushup/typescript-plugin` | TypeScript semantic errors                   |
| `@code-pushup/coverage-plugin`   | Line coverage from lcov reports              |
| `@code-pushup/axe-plugin`        | Accessibility (axe) when a URL is configured |

This monorepo ships **19** plugins under `@awesome-pushup-standards/*`. Per-plugin usage, audits, and examples live on each [plugin page](/plugins/python-quality/) (synced from package READMEs).

## How to read the tables below

The sections marked **auto-generated** are refreshed by `npm run docs:sync`:

- **Plugin summary** — one row per plugin: domain, kind, what it detects, external tools
- **Stack detector mappings** — audit → related plugins and tooling
- **Plugins by domain** — audits and configuration options per plugin
- **Preset composition** — which plugins each preset includes

Edit human-written content in [`scripts/plugins-catalog.intro.md`](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/scripts/plugins-catalog.intro.md) and curated metadata in [`scripts/plugin-catalog-meta.mjs`](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/scripts/plugin-catalog-meta.mjs).

---

> **Auto-generated below** by `npm run docs:sync` — do not edit tables in this file; update `scripts/plugin-catalog-meta.mjs`, package `audits.ts`, or preset imports instead.

## Plugin summary (auto-generated)

| Domain         | Plugin                                                     | Kind      | Detects                                                                                                 | External tools                                              | Details                                      |
| -------------- | ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| API design     | [`api-openapi`](/plugins/api-openapi/)                     | hybrid    | OpenAPI spec files, Spectral lint results, API versioning, and schema-first design signals              | `spectral`                                                  | [Full docs](/plugins/api-openapi/)           |
| Architecture   | [`architecture-rules`](/plugins/architecture-rules/)       | hybrid    | Forbidden imports, circular dependencies, and god modules via dependency-cruiser / import-linter        | `dependency-cruiser`, `import-linter`                       | [Full docs](/plugins/architecture-rules/)    |
| C++            | [`cpp-quality`](/plugins/cpp-quality/)                     | wrapper   | C/C++ sources and runs clang-tidy / cppcheck when installed                                             | `clang-tidy`, `cppcheck`                                    | [Full docs](/plugins/cpp-quality/)           |
| CI/CD          | [`cicd-quality`](/plugins/cicd-quality/)                   | heuristic | GitHub Actions workflows — CI presence, pinned actions, multi-OS matrix, nx affected, dependency review | —                                                           | [Full docs](/plugins/cicd-quality/)          |
| CI/CD          | [`contributor-hygiene`](/plugins/contributor-hygiene/)     | heuristic | Conventional commits, husky, prettier, knip, and related contributor tooling in the repo                | `knip`                                                      | [Full docs](/plugins/contributor-hygiene/)   |
| CI/CD          | [`release-quality`](/plugins/release-quality/)             | heuristic | Release hygiene — OIDC npm publish, changesets, and related release configuration                       | —                                                           | [Full docs](/plugins/release-quality/)       |
| Docker         | [`docker-quality`](/plugins/docker-quality/)               | hybrid    | Dockerfiles (hadolint), multi-stage builds, and image vulnerability scanning in CI                      | `hadolint`, `trivy`, `grype`                                | [Full docs](/plugins/docker-quality/)        |
| Documentation  | [`docs-quality`](/plugins/docs-quality/)                   | heuristic | README completeness, LICENSE, CONTRIBUTING, and other documentation files                               | —                                                           | [Full docs](/plugins/docs-quality/)          |
| Error handling | [`error-logging`](/plugins/error-logging/)                 | heuristic | Bare except clauses, structured logging setup, and console.log debug in source                          | —                                                           | [Full docs](/plugins/error-logging/)         |
| GTK/GNOME      | [`gtk-style`](/plugins/gtk-style/)                         | heuristic | GTK/GNOME C source patterns — GObject style, signal usage, and related conventions                      | —                                                           | [Full docs](/plugins/gtk-style/)             |
| JS/TS          | [`ts-stack-detector`](/plugins/ts-stack-detector/)         | heuristic | TypeScript, ESLint, and Zod setup in `package.json` and optionally `src/`                               | —                                                           | [Full docs](/plugins/ts-stack-detector/)     |
| LLM review     | [`llm-review`](/plugins/llm-review/)                       | hybrid    | Optional LLM rubric review for architecture, naming, and consistency (skips when not configured)        | —                                                           | [Full docs](/plugins/llm-review/)            |
| Python         | [`python-quality`](/plugins/python-quality/)               | wrapper   | Python project and runs ruff, mypy/ty, coverage, bandit, and pip-audit when installed                   | `ruff`, `mypy`, `ty`, `bandit`, `pip-audit`, `pytest-cov`   | [Full docs](/plugins/python-quality/)        |
| Python         | [`python-stack-detector`](/plugins/python-stack-detector/) | heuristic | Python stack tooling references in `pyproject.toml`                                                     | —                                                           | [Full docs](/plugins/python-stack-detector/) |
| Qt             | [`qt-quality`](/plugins/qt-quality/)                       | hybrid    | Qt CMake projects — clazy configuration, Qt API usage, optional clazy on PATH                           | `clazy`                                                     | [Full docs](/plugins/qt-quality/)            |
| React          | [`react-standards`](/plugins/react-standards/)             | heuristic | React 19 patterns in package.json and Vite config — state management, hooks, forms, bundle budget, a11y | `eslint-plugin-react-hooks`, `axe`                          | [Full docs](/plugins/react-standards/)       |
| Rust           | [`rust-modules`](/plugins/rust-modules/)                   | heuristic | Rust crate layout — module structure, public API surface, and binary crate conventions                  | —                                                           | [Full docs](/plugins/rust-modules/)          |
| Rust           | [`rust-quality`](/plugins/rust-quality/)                   | wrapper   | Rust workspace and runs cargo clippy, rustfmt, cargo audit, and cargo tarpaulin when installed          | `cargo clippy`, `rustfmt`, `cargo audit`, `cargo tarpaulin` | [Full docs](/plugins/rust-quality/)          |
| Security       | [`security-sast`](/plugins/security-sast/)                 | hybrid    | Secrets scanning config, dependency audit (npm/pip/cargo), SAST tooling, and SBOM generation in CI      | `gitleaks`, `npm audit`, `pip-audit`, `cargo audit`, `syft` | [Full docs](/plugins/security-sast/)         |

## Stack detector mappings (auto-generated)

### `python-stack-detector`

| Audit                  | Checks                                   | Suggests tooling            | Related plugins                                                                          |
| ---------------------- | ---------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `has-pydantic`         | `pydantic` in dependencies               | pydantic runtime validation | [`python-quality`](/plugins/python-quality/)                                             |
| `has-type-checker`     | `[tool.mypy]` section or `ty` configured | mypy or ty                  | [`python-quality`](/plugins/python-quality/)                                             |
| `has-ruff`             | `[tool.ruff]` section                    | ruff lint and format        | [`python-quality`](/plugins/python-quality/)                                             |
| `has-security-tooling` | bandit or pip-audit referenced           | bandit, pip-audit           | [`python-quality`](/plugins/python-quality/), [`security-sast`](/plugins/security-sast/) |

### `ts-stack-detector`

| Audit                | Checks                                                              | Suggests tooling       | Related plugins                                                                |
| -------------------- | ------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `suggest-typescript` | `typescript` in dependencies                                        | TypeScript compiler    | @code-pushup/typescript-plugin                                                 |
| `suggest-zod`        | `zod` in dependencies, or not needed for detected form/API patterns | Zod runtime validation | [`react-standards`](/plugins/react-standards/), @code-pushup/typescript-plugin |
| `suggest-eslint`     | `eslint` in dependencies                                            | ESLint                 | @code-pushup/eslint-plugin                                                     |

## Plugins by domain (auto-generated)

### Python

#### [`python-quality`](/plugins/python-quality/)

- **Kind:** wrapper
- **Detects:** Python project and runs ruff, mypy/ty, coverage, bandit, and pip-audit when installed
- **External tools:** `ruff`, `mypy`, `ty`, `bandit`, `pip-audit`, `pytest-cov`
- **Configuration:** `cwd` — Working directory (default: `.`)
- **Audits:**
  - `ruff-lint` — Ruff lint
  - `type-errors` — Type checker errors
  - `line-coverage` — Line coverage
  - `bandit-findings` — Bandit security findings
  - `dependency-vulnerabilities` — Dependency vulnerabilities

#### [`python-stack-detector`](/plugins/python-stack-detector/)

- **Kind:** heuristic
- **Detects:** Python stack tooling references in `pyproject.toml`
- **Configuration:** `pyprojectPath` — Path to pyproject.toml (default: `pyproject.toml`)
- **Audits:**
  - `has-pydantic` — Uses pydantic for validation
  - `has-type-checker` — Has mypy/ty configured
  - `has-ruff` — Has ruff configured
  - `has-security-tooling` — Has bandit/pip-audit

### Rust

#### [`rust-modules`](/plugins/rust-modules/)

- **Kind:** heuristic
- **Detects:** Rust crate layout — module structure, public API surface, and binary crate conventions
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `module-cycles` — Module dependency cycles
  - `banned-dependencies` — Banned dependencies

#### [`rust-quality`](/plugins/rust-quality/)

- **Kind:** wrapper
- **Detects:** Rust workspace and runs cargo clippy, rustfmt, cargo audit, and cargo tarpaulin when installed
- **External tools:** `cargo clippy`, `rustfmt`, `cargo audit`, `cargo tarpaulin`
- **Configuration:** `cwd` — Working directory (default: `.`)
- **Audits:**
  - `clippy-warnings` — Clippy warnings
  - `format-check` — Rustfmt format check
  - `advisory-vulnerabilities` — Cargo advisory vulnerabilities
  - `coverage` — Test coverage

### JS/TS

#### [`ts-stack-detector`](/plugins/ts-stack-detector/)

- **Kind:** heuristic
- **Detects:** TypeScript, ESLint, and Zod setup in `package.json` and optionally `src/`
- **Configuration:** `packageJsonPath` — Path to package.json (default: `package.json`); `scanSource` — Scan `src/` for form/API patterns that imply Zod need (default: `true`)
- **Audits:**
  - `suggest-typescript` — TypeScript configured
  - `suggest-zod` — Zod validation for forms/API
  - `suggest-eslint` — ESLint configured

### C++

#### [`cpp-quality`](/plugins/cpp-quality/)

- **Kind:** wrapper
- **Detects:** C/C++ sources and runs clang-tidy / cppcheck when installed
- **External tools:** `clang-tidy`, `cppcheck`
- **Configuration:** `cwd` — Working directory (default: `.`)
- **Audits:**
  - `clang-tidy-warnings` — Clang-tidy warnings
  - `cppcheck-issues` — Cppcheck issues
  - `format-violations` — Clang-format violations

### Qt

#### [`qt-quality`](/plugins/qt-quality/)

- **Kind:** hybrid
- **Detects:** Qt CMake projects — clazy configuration, Qt API usage, optional clazy on PATH
- **External tools:** `clazy`
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `clazy-warnings` — Clazy Qt warnings
  - `qt-api-misuse` — Qt API misuse checks

### GTK/GNOME

#### [`gtk-style`](/plugins/gtk-style/)

- **Kind:** heuristic
- **Detects:** GTK/GNOME C source patterns — GObject style, signal usage, and related conventions
- **Configuration:** `rootDir` — Project root (default: `.`); `sourceDir` — Source directory override (optional)
- **Audits:**
  - `gobject-macros` — GObject macro conventions
  - `availability-annotations` — GDK availability annotations
  - `style-consistency` — GNOME style consistency

### Architecture

#### [`architecture-rules`](/plugins/architecture-rules/)

- **Kind:** hybrid
- **Detects:** Forbidden imports, circular dependencies, and god modules via dependency-cruiser / import-linter
- **External tools:** `dependency-cruiser`, `import-linter`
- **Configuration:** `rootDir` — Project root (default: `.`); `godModuleImportThreshold` — Import count threshold for god-module audit (default: varies by preset)
- **Audits:**
  - `forbidden-imports` — Forbidden import rules configured
  - `circular-dependencies` — Circular dependency rules configured
  - `layer-violations` — Layer/architecture rules configured
  - `god-module` — No god modules (import threshold)

### API design

#### [`api-openapi`](/plugins/api-openapi/)

- **Kind:** hybrid
- **Detects:** OpenAPI spec files, Spectral lint results, API versioning, and schema-first design signals
- **External tools:** `spectral`
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `has-openapi-spec` — OpenAPI spec file present
  - `spectral-violations` — Spectral lint passes
  - `api-versioning` — API versioning in spec
  - `schema-first` — Schema-first API design

### React

#### [`react-standards`](/plugins/react-standards/)

- **Kind:** heuristic
- **Detects:** React 19 patterns in package.json and Vite config — state management, hooks, forms, bundle budget, a11y
- **External tools:** `eslint-plugin-react-hooks`, `axe`
- **Configuration:** `packageJsonPath` — Path to package.json (default: `package.json`)
- **Audits:**
  - `react-version` — React 19 or newer
  - `recommended-state-libs` — TanStack Query or Zustand
  - `hooks-rules` — eslint-plugin-react-hooks configured
  - `forms-validation` — react-hook-form + zod

### Error handling

#### [`error-logging`](/plugins/error-logging/)

- **Kind:** heuristic
- **Detects:** Bare except clauses, structured logging setup, and console.log debug in source
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `bare-except` — No bare except in Python
  - `structured-logging` — Structured logging configured
  - `no-print-debug` — No console.log in src/

### Security

#### [`security-sast`](/plugins/security-sast/)

- **Kind:** hybrid
- **Detects:** Secrets scanning config, dependency audit (npm/pip/cargo), SAST tooling, and SBOM generation in CI
- **External tools:** `gitleaks`, `npm audit`, `pip-audit`, `cargo audit`, `syft`
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `secrets-detected` — Secrets scanning configured
  - `dependency-audit` — Dependency vulnerabilities
  - `sast-findings` — SAST tooling present
  - `sbom-generated` — SBOM generation configured

### Docker

#### [`docker-quality`](/plugins/docker-quality/)

- **Kind:** hybrid
- **Detects:** Dockerfiles (hadolint), multi-stage builds, and image vulnerability scanning in CI
- **External tools:** `hadolint`, `trivy`, `grype`
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `hadolint-violations` — Hadolint Dockerfile violations
  - `multi-stage-build` — Multi-stage Docker build
  - `image-size` — Image size budget
  - `image-vulnerabilities` — Image vulnerability scanning in CI

### Documentation

#### [`docs-quality`](/plugins/docs-quality/)

- **Kind:** heuristic
- **Detects:** README completeness, LICENSE, CONTRIBUTING, and other documentation files
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `readme-completeness` — README completeness
  - `has-changelog` — Has changelog
  - `has-license` — Has license file
  - `has-contributing` — Has contributing guide

### CI/CD

#### [`cicd-quality`](/plugins/cicd-quality/)

- **Kind:** heuristic
- **Detects:** GitHub Actions workflows — CI presence, pinned actions, multi-OS matrix, nx affected, dependency review
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `ci-present` — GitHub Actions workflows present
  - `actions-pinned` — Actions pinned to commit SHA
  - `dependency-scanning-in-ci` — Dependency scanning in CI
  - `fork-safe-workflows` — Fork-safe workflow separation
  - `minimal-permissions` — Minimal workflow permissions
  - `release-concurrency` — Release concurrency guards
  - `multi-os-ci` — Multi-OS CI matrix
  - `nx-affected-ci` — Nx affected in CI
  - `dependency-review-workflow` — Dependency review workflow

#### [`contributor-hygiene`](/plugins/contributor-hygiene/)

- **Kind:** heuristic
- **Detects:** Conventional commits, husky, prettier, knip, and related contributor tooling in the repo
- **External tools:** `knip`
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `conventional-commits` — Conventional commits configured
  - `pre-commit-hooks` — Pre-commit hooks
  - `commitizen-configured` — Commitizen configured
  - `editorconfig-present` — EditorConfig present
  - `prettier-configured` — Prettier configured
  - `knip-configured` — Knip dead code detection
  - `env-example-present` — .env.example present

#### [`release-quality`](/plugins/release-quality/)

- **Kind:** heuristic
- **Detects:** Release hygiene — OIDC npm publish, changesets, and related release configuration
- **Configuration:** `rootDir` — Project root (default: `.`)
- **Audits:**
  - `npm-oidc-publish` — npm OIDC trusted publishing
  - `separated-release-publish` — Separated release and publish
  - `security-policy` — SECURITY.md policy
  - `pr-commitlint` — PR commitlint workflow
  - `pkg-preview-on-pr` — Package preview on PR
  - `release-environment` — Release GitHub environment

### LLM review

#### [`llm-review`](/plugins/llm-review/)

- **Kind:** hybrid
- **Detects:** Optional LLM rubric review for architecture, naming, and consistency (skips when not configured)
- **Configuration:** `rootDir` — Project root (default: `.`); `sourceDir` — Source directory override (optional)
- **Audits:**
  - `architecture-review` — Architecture and layering
  - `naming-review` — Naming quality
  - `consistency-review` — Code consistency
  - `modern-alternatives` — Modern alternatives
  - `readability-review` — Readability

## Preset composition (auto-generated)

| Preset                                                     | Domain    | @awesome-pushup-standards plugins                                                                                                                                                                                                                                                                                                                                                        | Official code-pushup plugins                                                                                                                                     |
| ---------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`cpp-qt-desktop`](/presets/cpp-qt-desktop/)               | C++/Qt    | [`audit-contract`](/plugins/audit-contract/), [`cpp-quality`](/plugins/cpp-quality/), [`docker-quality`](/plugins/docker-quality/), [`docs-quality`](/plugins/docs-quality/), [`qt-quality`](/plugins/qt-quality/), [`security-sast`](/plugins/security-sast/)                                                                                                                           | —                                                                                                                                                                |
| [`gtk-desktop`](/presets/gtk-desktop/)                     | GTK/GNOME | [`audit-contract`](/plugins/audit-contract/), [`cpp-quality`](/plugins/cpp-quality/), [`docs-quality`](/plugins/docs-quality/), [`gtk-style`](/plugins/gtk-style/), [`security-sast`](/plugins/security-sast/)                                                                                                                                                                           | —                                                                                                                                                                |
| [`monorepo-ci-strict`](/presets/monorepo-ci-strict/)       | CI/CD     | [`audit-contract`](/plugins/audit-contract/), [`cicd-quality`](/plugins/cicd-quality/), [`contributor-hygiene`](/plugins/contributor-hygiene/), [`docs-quality`](/plugins/docs-quality/), [`release-quality`](/plugins/release-quality/), [`security-sast`](/plugins/security-sast/)                                                                                                     | —                                                                                                                                                                |
| [`python-backend-strict`](/presets/python-backend-strict/) | Python    | [`api-openapi`](/plugins/api-openapi/), [`architecture-rules`](/plugins/architecture-rules/), [`audit-contract`](/plugins/audit-contract/), [`docker-quality`](/plugins/docker-quality/), [`docs-quality`](/plugins/docs-quality/), [`python-quality`](/plugins/python-quality/), [`python-stack-detector`](/plugins/python-stack-detector/), [`security-sast`](/plugins/security-sast/) | —                                                                                                                                                                |
| [`react-app`](/presets/react-app/)                         | React     | [`architecture-rules`](/plugins/architecture-rules/), [`audit-contract`](/plugins/audit-contract/), [`react-standards`](/plugins/react-standards/), [`security-sast`](/plugins/security-sast/), [`ts-stack-detector`](/plugins/ts-stack-detector/)                                                                                                                                       | axe (`@code-pushup/axe-plugin`), coverage (`@code-pushup/coverage-plugin`), eslint (`@code-pushup/eslint-plugin`), typescript (`@code-pushup/typescript-plugin`) |
| [`rust-cli`](/presets/rust-cli/)                           | Rust      | [`audit-contract`](/plugins/audit-contract/), [`docs-quality`](/plugins/docs-quality/), [`rust-modules`](/plugins/rust-modules/), [`rust-quality`](/plugins/rust-quality/), [`security-sast`](/plugins/security-sast/)                                                                                                                                                                   | —                                                                                                                                                                |
