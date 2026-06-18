---
title: Backlog
description: Open, deferred, and cancelled work items for awesome-pushup-standards.
---

# Backlog

**Operational source of truth** for what is open, deferred, or out of scope. CI/CD details: [monorepo-ci.md](/project/monorepo-ci/). Philosophy and roadmap: [Project vision](/project/vision/).

## Status taxonomy

| Status        | Meaning                                                 |
| ------------- | ------------------------------------------------------- |
| **Done**      | Implemented and verified (locally + CI when applicable) |
| **Pending**   | Planned or partially done — still requires action       |
| **Deferred**  | Consciously postponed — revisit later                   |
| **Cancelled** | Out of repository scope                                 |

## Pending

| Item                                    | Status      | Notes                                                                                                                               |
| --------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| E2E verification in Docker (19 plugins) | **Pending** | Locally: **38/38 passed**. Remaining: green `e2e` job on GitHub Actions. [E2E testing](/guides/e2e-testing/#verification-checklist) |
| Branch protection on `main`             | **Pending** | Checklist step 8 — configure manually in GitHub: [publication phase](/project/monorepo-ci/#publication-phase)                       |

## Deferred

Full descriptions and diagrams: [monorepo-ci — deferred roadmap](/project/monorepo-ci/#deferred-roadmap).

| Item                                                        | Priority | Link / notes                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Documentation registry per plugin/domain**                | P3       | Each plugin/preset: docs category (language/domain), README + Starlight page status, `publishedVia`; enforced in scaffold — [Documentation registry](/reference/documentation-registry/)                                                                                                                                                 |
| **`docs-quality`: wiki sync audits**                        | P3       | Extend `docs-quality` to verify docs are **generated and collected**: `doc-registry.json` entry, Starlight page `plugins/<slug>` / `presets/<slug>`, consistency with `packages/*/README.md` (e.g. audits `doc-registry-entry`, `starlight-page-synced`); optionally verify `npm run docs:verify` in CI                                  |
| **GitHub Pages for Starlight wiki**                         | P3       | Public docs URL; currently CI artifact `docs-dist` from `npm run docs:build`                                                                                                                                                                                                                                                             |
| **Simplicity audit** — report section per plugin / preset   | P4       | Review changes for reuse, simplification, dead-code cleanups; separate audit category alongside existing quality checks                                                                                                                                                                                                                  |
| **Bloat / code-review audit**                               | P4       | Similar to Simplicity but focused on bloat and diff review; consider as plugin, `llm-review` extension, or shared module                                                                                                                                                                                                                 |
| **Naming & structure conventions (single source of truth)** | P4       | Shared rules and audits for **file names**, **folder architecture**, **file structure**, **variable/function/type names**; one manifest (YAML/JSON beside `doc-registry` or separate `conventions-registry`) as **source of truth** feeding contributor-hygiene, architecture-rules, or a new `conventions` plugin — no duplicated rules |
| GitHub App bot for release commits                          | P3       | [§1](/project/monorepo-ci/#1-github-app-release-bot)                                                                                                                                                                                                                                                                                     |
| Full GitHub Actions SHA pinning                             | P2       | [§2](/project/monorepo-ci/#2-full-sha-pinning)                                                                                                                                                                                                                                                                                           |
| Codecov — matrix coverage per package                       | P2       | [§3](/project/monorepo-ci/#3-codecov-matrix-coverage)                                                                                                                                                                                                                                                                                    |
| Nx Release instead of Changesets                            | P4       | [§4](/project/monorepo-ci/#4-nx-release-instead-of-changesets)                                                                                                                                                                                                                                                                           |
| Nx Cloud (optional cache)                                   | P3       | [§5](/project/monorepo-ci/#5-nx-cloud-optional-cache)                                                                                                                                                                                                                                                                                    |

## Cancelled

| Item                                   | Notes                                                                                                                                                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm publish / Trusted Publisher (OIDC) | [publish.yml](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/.github/workflows/publish.yml) disabled; checklist step 6 Cancelled in [monorepo-ci](/project/monorepo-ci/#publication-phase) |

## Done

| Item                                                                                 | Details                                                                               |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 19 plugins + 6 presets                                                               | [domains.md](/reference/domains/)                                                     |
| Preset `monorepo-ci-strict`, 10 workflows, shift-left                                | [monorepo-ci.md](/project/monorepo-ci/)                                               |
| E2E infrastructure (19× `e2e/plugin-*-e2e`, Docker images, Nx `e2e` target)          | [e2e-testing.md](/guides/e2e-testing/)                                                |
| E2E contract standard: tool preflight, 38/38 collects                                | [e2e-contract-standard](/guides/e2e-testing/#e2e-contract-standard)                   |
| Starlight wiki: sync `packages/*/README.md`, documentation registry, CI artifact     | [documentation-registry](/reference/documentation-registry/)                          |
| Repo versioning `0.1.0` (changesets, no npm)                                         | [publication phase](/project/monorepo-ci/#publication-phase)                          |
| Docs guardrails: `docs:verify`, Prettier in sync, CI regression gate                 | [Contributing — documentation workflow](/guides/contributing/#documentation-workflow) |
| Documentation link check (lychee) in CI `docs` job                                   | [Contributing — documentation workflow](/guides/contributing/#documentation-workflow) |
| English operational wiki (backlog, monorepo-ci), `project/vision`, removed `PLAN.md` | [Project vision](/project/vision/)                                                    |

## Maintenance

- New open or deferred item → add to **Pending** or **Deferred** here; optional detail in `monorepo-ci.md`.
- When closed → move to **Done** (short note) or remove from **Pending**.
- Do not duplicate full tables — link to detailed docs.
