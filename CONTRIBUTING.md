# Contributing

Thank you for contributing to awesome-pushup-standards.

## Quality bar

Every new plugin or preset must meet:

1. **Tests** — Vitest unit tests in `tests/` with fixtures; no false positives on `examples/` demos.
2. **README** — usage example with `code-pushup.config.ts` snippet.
3. **PluginConfig compliance** — valid slugs (`/^[a-z\d]+(?:-[a-z\d]+)*$/`), scores 0–1.
4. **Graceful skip** — missing external tools or LLM endpoint must not break runs.
5. **Changeset** — run `npx changeset` for any published package change.
6. **English folder names** — `packages/plugins/`, `tests/fixtures/`, not localized paths.

## Process

1. Fork and branch from `main`.
2. Implement with tests.
3. Open PR — CI runs format, lint, affected test/build, and code-pushup.
4. Add a changeset describing the change.
5. Review and merge.

## Conventional commits

Use `npm run commit` (commitizen) or follow [Conventional Commits](https://www.conventionalcommits.org/). Husky runs commitlint on `commit-msg` and lint-staged on `pre-commit`.

PR titles are validated by `pr-commitlint.yml` (squash merge title).

## Nx affected

After installing dependencies:

```bash
npx nx affected -t lint,test,build --base=main
```

`nx affected` compares against git history on `main`. On a fresh clone before any commits exist locally, use:

```bash
npx nx run-many -t lint,test,build
```

## Fork workflow

External contributors should **fork** the repository and open PRs from their fork. Fork PRs run `code-pushup-fork.yml` (`pull_request_target`) without access to repository secrets. Same-repo PRs use `code-pushup.yml` and may upload reports when `CP_API_KEY` is configured.

See [docs/monorepo-ci.md](docs/monorepo-ci.md) for CI architecture and the [publication checklist](docs/monorepo-ci.md#faza-publikacji).

## Maintaining GitHub Actions pins (TODO)

Action references currently use version tags (`@v4`). Full commit SHA pinning is **deferred** — see [docs/monorepo-ci.md#2-pelne-pinowanie-sha-akcji-github](docs/monorepo-ci.md#2-pelne-pinowanie-sha-akcji-github).

When implementing SHA pins:

1. Resolve each action tag to its commit SHA (GitHub API or [pin-github-action](https://github.com/mheap/pin-github-action)).
2. Update all `.github/workflows/*.yml` and composite actions.
3. Document the update cadence here (e.g. quarterly or via Dependabot).

## Reference implementations

- Official plugins: `submodules/cli/packages/plugin-*`
- Community plugins: `submodules/community-plugins/packages/plugin-*`
- API contract: `submodules/cli/packages/models/docs/models-reference.md`

## Preset changes

Breaking changes to category weights or refs require a **major** version bump via changeset.
