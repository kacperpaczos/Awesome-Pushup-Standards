---
title: E2E testing
description: E2E testing — awesome-pushup-standards
---

# E2E testing per plugin

Each plugin has an isolated end-to-end project under `e2e/plugin-<slug>-e2e/` that runs `code-pushup collect` against **good** and **bad** fixtures and asserts on host reports under `e2e/plugin-<slug>-e2e/logs/<good|bad>/.code-pushup/report.json`.

## Running tests for all 19 plugins

From the **repository root**:

```bash
npm ci
npm run build
```

Git submodules (`submodules/cli`, `submodules/community-plugins`) are **optional** — reference copies for plugin authors, not required for tests or collect.

### Full test suite (unit + E2E + smoke)

Run all three layers of the pyramid in order:

```bash
# 1. Unit tests — every plugin under packages/plugins/* (min. 2 cases each)
npm run test:all

# 2. E2E — 19 plugins × good/bad = 38 collects + logs (sequential)
npm run e2e                 # existing Docker images
npm run e2e:rebuild         # rebuild images + run (first time / after Dockerfile changes)
npm run e2e:images          # Docker images only

# 3. Smoke — full monorepo preset (all plugins together)
npm run pushup
# equivalent: npx nx run awesome-pushup-standards:int-test
```

Expected E2E result: **Test Files 19 passed · Tests 38 passed**.

### E2E only (all plugins)

When unit tests and build already succeeded:

```bash
npm run e2e:images   # once, or when docker/e2e/* changed
npm run e2e
# or one command (images + tests):
npm run e2e:rebuild
```

`npm run e2e` runs Vitest sequentially (`maxWorkers: 1`), enables collect logging, and prints log paths at the end.

Single plugin:

```bash
npm run e2e -- python-quality
```

Alternative via Nx (Vitest directly — logs still enabled via `vitest.e2e.config.ts` globalSetup):

```bash
npx nx run-many -t e2e --parallel=1
```

### Reports on disk

Canonical reports are written to:

```
e2e/plugin-<slug>-e2e/logs/good/.code-pushup/report.json
e2e/plugin-<slug>-e2e/logs/bad/.code-pushup/report.json
```

Fixture `.code-pushup/` directories are cleaned after each test; `logs/` is the source of truth.

### Single plugin

Run one plugin's E2E project (good + bad):

```bash
npx vitest run e2e/plugin-python-quality-e2e/tests/collect.e2e.test.ts --config vitest.e2e.config.ts --maxWorkers=1
```

Replace `python-quality` with any plugin slug. To collect and keep the report without Vitest:

```bash
REPO="$(pwd)"
FIXTURE="$REPO/e2e/plugin-python-quality-e2e/mocks/fixtures/good"

docker run --rm \
  -v "$REPO:$REPO" \
  -w "$FIXTURE" \
  --network host \
  e2e-python:3.12 \
  bash -c "git config --global --add safe.directory $REPO && npx code-pushup collect --config code-pushup.config.ts"
```

Use the Docker image from the [plugin → image table](#docker-images) below (`e2e-node:20` for Node plugins, etc.).

### Without Docker

Only Node/heuristic plugins produce meaningful reports on the host:

```bash
E2E_USE_DOCKER=0 npm run e2e
```

Python, Rust, C++/Qt, GTK, and security plugins require Docker images.

## How a collect run works

Each E2E test is a real `code-pushup collect` inside Docker, followed by assertions on a fresh host report. The line `E2E collect log → …` at startup only initializes the combined log file — tests run immediately after.

```mermaid
sequenceDiagram
  participant User
  participant RunE2E as run-e2e.mjs
  participant Vitest
  participant GlobalSetup as globalSetup
  participant Test as collect.e2e.test.ts
  participant Docker
  participant CP as code-pushup collect
  participant Logs as e2e/logs/

  User->>RunE2E: npm run e2e
  RunE2E->>Vitest: vitest run --config vitest.e2e.config.ts
  Vitest->>GlobalSetup: initCollectLog()
  GlobalSetup->>Logs: create e2e/logs/latest.log
  GlobalSetup-->>User: E2E collect log path

  loop 38 tests (19 plugins x good/bad)
    Test->>Test: runCollectInContainer()
    Test->>Docker: tool preflight (command -v + --version)
    Docker-->>Test: toolPreflight in meta.json / collect.log
    Test->>Docker: docker run -v repo -w fixture image
    Docker->>CP: npx code-pushup collect
    CP->>Logs: report.json under logs/good|bad/.code-pushup/
    Test->>Test: assertCollectResultIsFresh()
    Test->>Test: assertGoodFixtureContract / assertBadFixtureContract
    Test->>Logs: collect.log, stdout, stderr, meta.json
  end

  RunE2E->>Logs: write index.json
```

| npm script              | What it does                              |
| ----------------------- | ----------------------------------------- |
| `npm run e2e`           | Run all 38 collects (existing images)     |
| `npm run e2e:rebuild`   | `docker compose build` then `npm run e2e` |
| `npm run e2e:images`    | Build Docker images only                  |
| `npm run e2e -- <slug>` | One plugin (good + bad)                   |

## E2E contract standard

Every plugin E2E test follows the same **contract-first** flow. The line `E2E collect log → …` at startup only initializes the combined log — the real test is preflight → collect → assertions on a fresh report.

### Flow (per good/bad fixture)

1. **Tool preflight** — before `code-pushup collect`, the runner checks each tool from `PLUGIN_CONTRACTS[slug].tools` inside the same Docker image and mount (`command -v` + `--version`). Missing required tools fail fast with a clear error.
2. **Collect** — `code-pushup collect` runs in Docker with host-owned output under `logs/<variant>/.code-pushup/`.
3. **Fresh report** — `assertCollectResultIsFresh` requires a new `report.json` (mtime, no `EACCES`, no “Generated reports failed”).
4. **Contract assertions** — good/bad rules from `testing/e2e-utils/src/plugin-contracts.ts`.
5. **Logs & artifacts** — `collect.log`, `stdout.log`, `stderr.log`, `meta.json` (includes `toolPreflight`), `artifacts/report.json`.

### `PluginContract` fields

Defined in `testing/e2e-utils/src/plugin-contracts.ts`:

| Field                 | Purpose                                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| `image`               | Docker image (`e2e-node:20`, `e2e-python:3.12`, …)                       |
| `tools`               | Required toolchain preflight specs (`name`, `command`, optional `args`)  |
| `good.requiredAudits` | Audits that must **not** be skipped                                      |
| `good.minScore`       | Minimum score (usually `0.9`) for non-excluded audits                    |
| `good.excludeSlugs`   | Audits excluded from min-score check (optional tools, coverage, etc.)    |
| `bad.mode`            | `failing-audit` (target audit `score === 0`) or `all-skipped` (LLM mock) |
| `bad.failingAudit`    | Slug expected to fail on the bad fixture                                 |

### Standard test file

Most plugins use one line:

```ts
import { createStandardPluginE2eTests } from '@awesome-pushup/e2e-utils';

createStandardPluginE2eTests('python-quality');
```

That helper runs good + bad collects, asserts the contract, and cleans fixture `.code-pushup/` after each test (canonical reports stay in `logs/`).

### Reading logs and reports

**`collect.log`** — full section per collect: image, docker command, tool preflight table, stdout/stderr, audit summary, full `report.json`.

**`meta.json`** — machine-readable metadata:

```json
{
  "toolPreflight": [
    { "name": "ruff", "status": "ok", "path": "/usr/local/bin/ruff", "version": "ruff 0.15.17" }
  ],
  "exitCode": 0,
  "durationMs": 7000,
  "reportPath": "…/logs/good/.code-pushup/report.json"
}
```

**`report.json`** — code-pushup output; assert on audit `slug`, `score`, and `displayValue`. Required audits must not contain `skipped` / `not found` / `not installed`.

**Combined index** — `e2e/logs/index.json` lists all 38 entries; `e2e/logs/latest.log` concatenates every section from the last run.

### Adding a new plugin (contract checklist)

1. Implement plugin + unit tests under `packages/plugins/<slug>/`.
2. Add `PLUGIN_CONTRACTS['<slug>']` with `image`, `tools`, `good`, and `bad` fixtures.
3. Scaffold E2E: `node scripts/scaffold-e2e.mjs` (or copy an existing `e2e/plugin-*-e2e/` layout).
4. Create **good** fixture (tools green, audits ≥ min score) and **bad** fixture (one audit fails with `score=0`).
5. Use `createStandardPluginE2eTests('<slug>')` unless the plugin needs custom setup (e.g. LLM mock server).
6. Verify: `npm run e2e:images && npm run e2e -- <slug>` — check `meta.json` has populated `toolPreflight`.

## Test pyramid

```mermaid
flowchart TB
  subgraph unit [Unit — Vitest]
    U[packages/plugins/*/tests/*.test.ts]
  end

  subgraph e2e [E2E — Docker collect]
    E[e2e/plugin-*-e2e/tests/*.e2e.test.ts]
  end

  subgraph smoke [Smoke — monorepo preset]
    S[root int-test: code-pushup collect]
  end

  unit --> e2e --> smoke
```

| Layer | Command                                        | Scope                            |
| ----- | ---------------------------------------------- | -------------------------------- |
| Unit  | `npm run test:all`                             | 19 plugins, runner logic         |
| E2E   | `npm run e2e`                                  | 19× good/bad fixture collect     |
| Smoke | `npx nx run awesome-pushup-standards:int-test` | Full `monorepo-ci-strict` preset |

## Prerequisites

- Docker (recommended for CI parity)
- `npm ci && npm run build` at repo root

E2E runs **sequentially** (`maxWorkers: 1`) — one Docker collect at a time. Do not raise Vitest parallelism; parallel `docker run` calls contend on the shared repo mount and `node_modules`.

## Local commands

Quick reference (see [Running tests for all 19 plugins](#running-tests-for-all-19-plugins) above for the full walkthrough):

Quick reference:

```bash
npm run e2e                  # all plugins + logs
npm run e2e:rebuild          # rebuild images + e2e + logs
npm run e2e:images           # Docker images only
npm run e2e -- docs-quality  # one plugin
```

## Collect logs (stdout + report per container)

Logs are written **on the host** (your user, `644` files / `755` dirs) — not as root inside Docker. On Linux, containers run with `--user $(id -u):$(id -g)` and reports are persisted directly to `logs/<variant>/.code-pushup/`.

### Per test project (recommended)

Each collect copies output into the E2E project tree:

```text
e2e/plugin-<slug>-e2e/logs/good/
├── collect.log      # full section: command, stdout, stderr, report summary
├── stdout.log       # container stdout only
├── stderr.log       # container stderr only
├── report.json      # code-pushup report (host copy)
├── report.md        # if generated
├── meta.json        # image, exit code, duration, toolPreflight, artifact paths
└── artifacts/       # copy of persisted outputs from logs/<variant>/.code-pushup/*

e2e/plugin-<slug>-e2e/logs/bad/
└── … same layout
```

Example:

```bash
cat e2e/plugin-python-quality-e2e/logs/good/stdout.log
cat e2e/plugin-python-quality-e2e/logs/good/report.json
ls e2e/plugin-python-quality-e2e/logs/good/artifacts/
```

### Combined log (all 38 collects)

```text
e2e/logs/latest.log
e2e/logs/index.json
```

Vitest prints the path at startup: `E2E collect log → …/e2e/logs/latest.log`.

Each section includes fixture path, Docker image, **tool preflight**, command, stdout/stderr, audit summary, and full `report.json`.

```bash
grep -A30 'plugin-python-quality-e2e/mocks/fixtures/good' e2e/logs/latest.log
jq '.entries[] | select(.plugin=="python-quality" and .variant=="good")' e2e/logs/index.json
```

Audit slugs map to tools (e.g. `ruff-lint` → ruff). Full tool chains: `packages/plugins/<slug>/README.md`.

Log directories are gitignored (`e2e/**/logs/**`). Disable logging with `E2E_COLLECT_LOG=0`.

## Troubleshooting

### Tests hang on „bad fixture fails expected audit”

**Symptom:** Vitest shows many plugins running at once; several `docker run` lines spin; you need `Ctrl+C`.

**Cause:** Parallel E2E collects mount the same repo and run `npx code-pushup` against shared `node_modules` — Docker and npm lock up.

**Fix:** Always use the repo scripts (they force `--maxWorkers=1`):

```bash
npm run e2e
# not: vitest run --config vitest.e2e.config.ts   # may parallelize
```

During a run, `docker ps` should show **at most one** `e2e-*` container.

### After interrupting a run

```bash
docker ps          # check for leftover containers
docker container prune -f   # if needed
```

Then re-run `npm run e2e`.

### Expected duration

Full suite: **~2–4 minutes** sequentially (38 collects). „Bad” fixtures (Python, Rust, C++) take longer than „good” — that is normal, not a hang.

### Optional reference submodules

Only needed when browsing official plugin examples locally:

```bash
git submodule update --init --recursive
```

See [CONTRIBUTING.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/CONTRIBUTING.md) for paths under `submodules/`.

## Docker images

| Image             | Plugins                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `e2e-node:20`     | docs, cicd, contributor, release, ts-stack, react, docker, architecture, api-openapi, error-logging, llm-review |
| `e2e-python:3.12` | python-stack-detector, python-quality                                                                           |
| `e2e-rust:1.83`   | rust-quality, rust-modules                                                                                      |
| `e2e-cpp:qt`      | cpp-quality, qt-quality                                                                                         |
| `e2e-gtk:c`       | gtk-style                                                                                                       |
| `e2e-security`    | security-sast                                                                                                   |

Images are defined in `docker/e2e/*/Dockerfile` and orchestrated by `docker-compose.e2e.yml`.

## Project layout (per plugin)

```
e2e/plugin-<slug>-e2e/
├── project.json
├── vitest.e2e.config.ts
├── mocks/fixtures/
│   ├── good/                 # expected audits ≥ 0.9 (non-skipped)
│   │   ├── code-pushup.config.ts
│   │   └── … minimal project files
│   └── bad/                  # known violation → target audit score 0
└── tests/collect.e2e.test.ts
```

Fixtures import **one** plugin from `@awesome-pushup-standards/<slug>` via `code-pushup.config.ts`.

## Shared helpers

`testing/e2e-utils/` provides:

- `createStandardPluginE2eTests(slug)` — good/bad contract test boilerplate
- `runPluginContractCollect`, `assertGoodFixtureContract`, `assertBadFixtureContract`
- `runCollectInContainer({ fixtureRelPath, image, pluginSlug })` — preflight + Docker collect; writes `logs/<good|bad>/` + `e2e/logs/latest.log`
- `runToolPreflightInContainer`, `assertToolPreflightOk` — toolchain verification before collect
- `PLUGIN_CONTRACTS` — image, tools, good/bad contract per plugin
- `cleanupE2eFixtureReports(fixtureRoot)` — always cleans fixture `.code-pushup/` (reports are canonical in `logs/`)
- `readReport`, `assertAudits`, `assertAllAuditsMinScore`, `assertNoSkippedRequired`
- `isDockerAvailable`, `E2E_IMAGES`, `dockerRuntimeEnv`, `E2E_DOCKER_PATH`

See [E2E contract standard](#e2e-contract-standard) for the full flow.

## Plugin → image map

See `scripts/scaffold-e2e.mjs` for the canonical mapping and fixture definitions. Regenerate projects after changing the manifest:

```bash
node scripts/scaffold-e2e.mjs
```

## CI

GitHub Actions job `e2e` in `.github/workflows/ci.yml` runs `npm run e2e:rebuild` and uploads `e2e/logs/latest.log`, `e2e/logs/index.json`, and `e2e/plugin-*-e2e/logs/**` as artifacts.

## Verification checklist

Operational status: **[backlog — Pending](/project/backlog/#pending)**.

| Step                                 | Command / action                     | Status                          |
| ------------------------------------ | ------------------------------------ | ------------------------------- |
| Build Docker images                  | `npm run e2e:images`                 | **Done** (obrazy zbudowane)     |
| Run all plugin E2E locally           | `npm run e2e` (38 tests, 19 plugins) | **Done** (38/38 passed, Docker) |
| CI job `e2e` green on GitHub Actions | push to `main` / PR                  | **Pending**                     |

After all three pass, update [backlog.md](/project/backlog/): move E2E verification from Pending to Done.

## Adding a new plugin

1. Implement plugin under `packages/plugins/<slug>/` with unit tests (min. 2 cases).
2. Add `PLUGIN_CONTRACTS['<slug>']` in `testing/e2e-utils/src/plugin-contracts.ts` (image, tools, good/bad).
3. Add entry to `scripts/scaffold-e2e.mjs` and run `node scripts/scaffold-e2e.mjs`.
4. Verify locally: `npm run e2e:images && npm run e2e -- <slug>` — confirm `meta.json` lists tool versions.

See [E2E contract standard](#e2e-contract-standard) and [CONTRIBUTING.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/CONTRIBUTING.md).
