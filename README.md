# awesome-pushup-standards

**code-pushup as the guru orchestrating every quality tool.**

Curated plugins and presets for [code-pushup](https://github.com/code-pushup/cli) CLI. code-pushup does not replace quality tools — it orchestrates them into a single scoreboard with audits (0–1), groups, and weighted categories.

## Philosophy

1. **Orchestration, not reinvention** — wrap ruff, ESLint, clippy, Spectral, hadolint, and more.
2. **Presets raise the bar** — `python-backend-strict`, `react-app`, and others ship ready-made weights.
3. **Quality leaps** — heuristic plugins suggest pydantic, Zod, TypeScript adoption.
4. **Non-blocking** — visibility and trends, not arbitrary CI pass/fail gates.

## Domains

Languages (Python, Rust, JS/TS, C++), architecture, API design, React, validation, error handling, code quality, security, Docker, documentation, CI/CD, and optional LLM review.

See [docs/domains.md](docs/domains.md) for implementation status.

## Install

```bash
npm install -D @awesome-pushup-standards/python-backend-strict @code-pushup/cli
```

## Usage

```bash
npx code-pushup collect
```

## Quick start

This repo dogfoods the monorepo CI preset:

```ts
// code-pushup.config.ts
import monorepoCiStrict from '@awesome-pushup-standards/monorepo-ci-strict';

export default await monorepoCiStrict({ rootDir: '.' });
```

Other presets (e.g. Python backend):

```ts
import pythonBackendStrict from '@awesome-pushup-standards/python-backend-strict';

export default await pythonBackendStrict();
```

```bash
npx code-pushup collect
```

## Packages

### Plugins

| Package                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `python-stack-detector` | Heuristic Python stack checks                 |
| `python-quality`        | ruff, mypy, pytest-cov, bandit, pip-audit     |
| `rust-quality`          | clippy, rustfmt, cargo-audit, tarpaulin       |
| `rust-modules`          | Module cycles, cargo-deny                     |
| `cpp-quality`           | clang-tidy, cppcheck, clang-format            |
| `qt-quality`            | clazy, Qt API checks                          |
| `gtk-style`             | GNOME/GTK style conventions                   |
| `ts-stack-detector`     | TypeScript, Zod, ESLint heuristics            |
| `architecture-rules`    | dependency-cruiser, import-linter, god-module |
| `api-openapi`           | OpenAPI spec, Spectral, versioning            |
| `react-standards`       | React 19, state libs, hooks, forms            |
| `docker-quality`        | hadolint, multi-stage, image scan CI          |
| `error-logging`         | bare except, structured logging               |
| `cicd-quality`          | CI workflows, pinned actions, Nx affected     |
| `contributor-hygiene`   | commitlint, husky, prettier, knip             |
| `release-quality`       | OIDC publish, separated release               |
| `docs-quality`          | README, changelog, license                    |
| `security-sast`         | Secrets, dependency audit, SAST               |
| `llm-review`            | Optional LLM rubric review                    |

### Presets

| Package                 | Description                             |
| ----------------------- | --------------------------------------- |
| `python-backend-strict` | Python backend (full stack)             |
| `react-app`             | React + TS + ESLint + standards         |
| `rust-cli`              | Rust CLI applications                   |
| `cpp-qt-desktop`        | C++/Qt desktop apps                     |
| `gtk-desktop`           | GTK/GNOME desktop apps                  |
| `monorepo-ci-strict`    | Monorepo CI/CD + shift-left (this repo) |

## CI/CD architecture

GitHub Actions follow [code-pushup/cli](https://github.com/code-pushup/cli) patterns:

- **Nx affected** — lint, test, build only changed packages
- **Multi-OS matrix** — ubuntu, windows, macos
- **Fork-safe** — separate `code-pushup-fork.yml` for untrusted PRs
- **OIDC publish** — npm trusted publishing on release tags (no `NPM_TOKEN`)
- **Shift-left** — husky, commitlint, prettier, knip locally

Optional secrets: `NX_CLOUD_ACCESS_TOKEN`, `CODECOV_TOKEN`, `CP_API_KEY`.

```mermaid
flowchart LR
  subgraph pr [Pull Request]
    A[format + lint]
    B[test matrix 3 OS]
    C[nx affected build]
    D[code-pushup dogfood]
    E[pkg-pr-new preview]
  end

  subgraph cd [Release CD]
    F[release.yml changesets]
    G[publish.yml OIDC tag]
  end

  pr --> cd
```

Full architecture, audit mapping, and **TODO roadmap**: [docs/monorepo-ci.md](docs/monorepo-ci.md).

### TODO — deferred (to consider)

| Item                                | Status      | Notes                                                      |
| ----------------------------------- | ----------- | ---------------------------------------------------------- |
| GitHub App bot for release commits  | Deferred    | Requires org App setup (`GH_APP_ID`, `GH_APP_PRIVATE_KEY`) |
| Full SHA pinning for GitHub Actions | Deferred    | Currently `@v4` tags; supply-chain hardening planned       |
| Codecov matrix per package          | Deferred    | Needs `vitest --coverage` + `coverage.yml`                 |
| Nx Release instead of Changesets    | Deferred    | Migrate after conventional commits stabilize               |
| Nx Cloud remote cache               | Optional    | Enable with `NX_CLOUD_ACCESS_TOKEN`                        |
| E2E Nx target for examples          | Placeholder | After full demo scenarios exist                            |

See [docs/monorepo-ci.md#todo--do-rozwazenia](docs/monorepo-ci.md#todo--do-rozwazenia) for details and diagrams.

## Getting started for maintainers

1. Clone with submodules: `git clone --recurse-submodules <repo-url>`
2. Install and verify: `npm ci && npm run build && npm test && npm run pushup`
3. First-time publish checklist: [docs/monorepo-ci.md#faza-publikacji](docs/monorepo-ci.md#faza-publikacji)
4. Optional GitHub secrets: `NX_CLOUD_ACCESS_TOKEN`, `CP_API_KEY`, `CODECOV_TOKEN`
5. npm release requires **Trusted Publisher** (OIDC) + GitHub environment **`release`**
6. Contributors: fork → PR (fork PRs use `code-pushup-fork.yml` without secrets)

## Development

```bash
git submodule update --init --recursive
npm ci
npm run build
npm test
npm run format
npx nx affected -t lint,test,build --base=main
npm run pushup
```

Reference repos (submodules):

- [code-pushup/cli](https://github.com/code-pushup/cli)
- [code-pushup/community-plugins](https://github.com/code-pushup/community-plugins)

## Documentation

- [Plugin authoring](docs/plugin-authoring.md)
- [Scoring model](docs/scoring-model.md)
- [Domains](docs/domains.md)
- [Monorepo CI/CD](docs/monorepo-ci.md)
- [LLM configuration](docs/llm-configuration.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
