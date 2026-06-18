---
title: "monorepo-ci-strict"
description: "Strict CI/CD monorepo preset for [code-pushup](https://github.com/code-pushup/cli)."
domain: "CI/CD"
packageSlug: "monorepo-ci-strict"
packageKind: "preset"
sourceReadme: "packages/presets/monorepo-ci-strict/README.md"
---

> **Edit source:** [packages/presets/monorepo-ci-strict/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/presets/monorepo-ci-strict/README.md) — this page is synced by `npm run docs:sync`.

Strict CI/CD monorepo preset for [code-pushup](https://github.com/code-pushup/cli).
## Plugins

- `cicd-quality` — GitHub Actions, Nx affected, fork-safe workflows
- `contributor-hygiene` — commitlint, husky, prettier, knip
- `release-quality` — OIDC publish, separated release/publish
- `docs-quality` — README, CONTRIBUTING
- `security-sast` — dependency audit, secrets (informational)
## Usage

```ts
import monorepoCiStrict from '@awesome-pushup-standards/monorepo-ci-strict';

export default await monorepoCiStrict({ rootDir: '.' });
```

```bash
npx code-pushup collect
```
