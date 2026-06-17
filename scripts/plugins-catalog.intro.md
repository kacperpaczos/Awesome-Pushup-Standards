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
