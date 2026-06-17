---
title: Contributing
description: Quality bar, PR workflow, and conventions for awesome-pushup-standards.
---

# Contributing

Thank you for contributing to awesome-pushup-standards.

## Quality bar

Every new plugin or preset must meet:

1. **Unit tests** — min. 4 Vitest cases in `tests/` (positive, negative, tool not installed → score=0, empty project).
2. **E2E** — `e2e/plugin-<slug>-e2e/` with good/bad fixtures; see [E2E testing](/guides/e2e-testing/#running-tests-for-all-19-plugins).
3. **README** — usage example with `code-pushup.config.ts` snippet in `packages/plugins/<slug>/README.md` (synced to Starlight via `npm run docs:sync`).
4. **Documentation registry** — add domain mapping in `scripts/sync-docs-to-starlight.mjs` and run sync so [Documentation registry](/reference/documentation-registry/) lists the package.
5. **PluginConfig compliance** — valid slugs (`/^[a-z\d]+(?:-[a-z\d]+)*$/`), scores 0–1.
6. **Graceful skip** — missing external tools or LLM endpoint must not break runs.
7. **Changeset** — run `npx changeset` for any published package change.
8. **English folder names** — `packages/plugins/`, `tests/fixtures/`, not localized paths.

## Process

1. Fork and branch from `main`.
2. Implement with tests.
3. Open PR — CI runs format, lint, affected test/build, e2e (Docker), docs build, and code-pushup.
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

On a fresh clone before any commits exist locally:

```bash
npx nx run-many -t lint,test,build
```

## Fork workflow

External contributors should **fork** the repository and open PRs from their fork. Fork PRs run `code-pushup-fork.yml` (`pull_request_target`) without access to repository secrets. Same-repo PRs use `code-pushup.yml` and may upload reports when `CP_API_KEY` is configured.

See [Monorepo CI/CD](/project/monorepo-ci/) for CI architecture and the [publication checklist](/project/monorepo-ci/#faza-publikacji).

## Maintaining GitHub Actions pins (TODO)

Action references currently use version tags (`@v4`). Full commit SHA pinning is **deferred** — see [Monorepo CI — SHA pinning](/project/monorepo-ci/#2-pełne-pinowanie-sha-akcji-github).

## Reference implementations

- Official plugins: `submodules/cli/packages/plugin-*`
- Community plugins: `submodules/community-plugins/packages/plugin-*`
- API contract: `submodules/cli/packages/models/docs/models-reference.md`

## Preset changes

Breaking changes to category weights or refs require a **major** version bump via changeset.

## Documentation workflow

- Edit plugin/preset usage in `packages/*/README.md`.
- Edit guides and project docs in `apps/docs/src/content/docs/`.
- Run `npm run docs:sync` before committing doc changes (or rely on `docs:build` in CI).
