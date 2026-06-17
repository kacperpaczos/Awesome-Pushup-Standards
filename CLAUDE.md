# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of [code-pushup](https://github.com/code-pushup/cli) plugins and presets that wrap external quality tools (ruff, clippy, ESLint, Spectral, hadolint, …) and produce a unified scoreboard. The root package (`awesome-pushup-standards`) is private; published packages live under `packages/`.

## Commands

```bash
npm ci && npm run build          # install + compile all TypeScript
npm run test:all                 # all unit tests (vitest)
npm run lint                     # eslint across workspace
npm run format                   # prettier check
npm run format:write             # prettier fix

# Run a single plugin's unit tests
npx vitest run packages/plugins/<slug>/tests/

# Run affected packages only (after branching from main)
npx nx affected -t lint,test,build --base=main
# On a fresh clone with no local commits yet
npx nx run-many -t lint,test,build

# E2E — requires Docker
npm run e2e                      # all plugins (sequential)
npm run e2e:rebuild              # rebuild Docker images first, then run
npm run e2e -- python-quality    # single plugin

# Docs site (Starlight / Astro)
npm run docs:sync                # sync package READMEs → Starlight + rebuild registry
npm run docs:verify              # sync + assert generated docs match git
npm run docs:dev                 # sync + dev server at http://localhost:4321
npm run docs:build               # sync + static build

# Release
npx changeset                    # add a changeset entry
npm run version-packages         # bump versions
npm run release                  # publish to npm

# Commits
npm run commit                   # commitizen prompt (enforces conventional commits)
```

Husky hooks: `commit-msg` → commitlint, `pre-commit` → lint-staged.

## Monorepo layout

```
packages/
  plugins/<slug>/      # 19 published plugins
  presets/<slug>/      # 6 published presets
apps/
  docs/                # Astro/Starlight documentation site
e2e/
  plugin-<slug>-e2e/  # one folder per plugin (good + bad fixtures)
    mocks/fixtures/good|bad/
    tests/collect.e2e.test.ts
testing/
  e2e-utils/src/       # shared E2E helpers (contract-test.ts, run-collect.ts, …)
scripts/
  sync-docs-to-starlight.mjs
  run-e2e.mjs
examples/              # demo projects (cpp-qt-demo, python-fastapi-demo, …)
```

Each plugin package has:

- `src/index.ts` — exports `async function create(options): Promise<PluginConfig>`
- `src/audits.ts` — static `Audit[]` array (slugs + titles)
- `src/runner.ts` — `createRunner(options)` returning the async runner function
- `tests/` — Vitest unit tests

## Plugin architecture

Every plugin exports a default `create(options?)` function returning a `PluginConfig` from `@code-pushup/models`.

Two patterns:

1. **Heuristic** — reads project files, returns binary scores (0/1) for presence/absence checks.
2. **Wrapper** — shells out to an external CLI (`spectral`, `ruff`, `cargo clippy`, …). Missing-tool behavior depends on `rigor` — see [audit contracts](apps/docs/src/content/docs/reference/audit-contracts.md).

Audit slug rules: `/^[a-z\d]+(?:-[a-z\d]+)*$/`, max 128 chars, English kebab-case only.

Scores must be 0–1 (floats). Missing tool = skip, not crash.

## Presets

Presets aggregate multiple plugins into a `CoreConfig` (plugins + categories with weighted refs). They live in `packages/presets/<slug>/src/index.ts`. Breaking changes to category weights require a **major** version bump via changeset.

## E2E testing

E2E tests run `code-pushup collect` inside Docker containers defined in `docker-compose.e2e.yml`.

Every plugin has a contract in `testing/e2e-utils/src/plugin-contracts.ts`:

- `image` — which Docker image to use (`e2e-node:20`, `e2e-python:3.12`, …)
- `good.minScore`, `good.requiredAudits` — assertions on the good fixture
- `bad.mode` — either `failing-audit` (a specific audit must score 0) or `all-skipped`

Each `e2e/plugin-<slug>-e2e/tests/collect.e2e.test.ts` calls `createStandardPluginE2eTests('<slug>')` which handles both fixtures. Logs land in `e2e/plugin-*-e2e/logs/{good,bad}/`.

## Documentation sync

Package READMEs (`packages/*/README.md`) are the source of truth for usage docs. `npm run docs:sync` copies them into `apps/docs/src/content/docs/plugins/` and `…/presets/`, regenerates `doc-registry.json`, `sidebar.generated.mjs`, and `reference/documentation-registry.md`.

When adding a new plugin/preset, register its domain mapping in `scripts/sync-docs-to-starlight.mjs` under `PLUGIN_DOMAINS` or `PRESET_DOMAINS`, then run `npm run docs:verify`.

Project context: [vision](apps/docs/src/content/docs/project/vision.md), [backlog](apps/docs/src/content/docs/project/backlog.md). AI agent pointers: [AGENTS.md](AGENTS.md).

## Adding a new plugin checklist

1. Create `packages/plugins/<slug>/` with `src/index.ts`, `src/audits.ts`, `src/runner.ts`, `tests/`, `README.md`, `package.json`, `tsconfig.json`.
2. Add at least 2 Vitest unit tests (positive + negative paths).
3. Create `e2e/plugin-<slug>-e2e/` with `mocks/fixtures/good/`, `mocks/fixtures/bad/`, and `tests/collect.e2e.test.ts` calling `createStandardPluginE2eTests('<slug>')`.
4. Add a contract entry in `testing/e2e-utils/src/plugin-contracts.ts`.
5. Register domain in `scripts/sync-docs-to-starlight.mjs`.
6. Run `npm run docs:sync`.
7. Run `npx changeset` to record the change.

## Release & CI

- CI (`ci.yml`) runs: format → lint → unit-test (Linux/Windows/macOS) → build → docs (verify + build + link check) → e2e → pkg-pr-new.
- Same-repo PRs can upload code-pushup reports when `CP_API_KEY` is set. Fork PRs use `code-pushup-fork.yml` (no secrets).
- Releases use Changesets: `npm run version-packages` then `npm run release`.
