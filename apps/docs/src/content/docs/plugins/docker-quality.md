---
title: "docker-quality"
description: "Wrapper plugin for Dockerfile linting via hadolint."
domain: "Docker"
packageSlug: "docker-quality"
packageKind: "plugin"
sourceReadme: "packages/plugins/docker-quality/README.md"
---

> **Edit source:** [packages/plugins/docker-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/docker-quality/README.md) — this page is synced by `npm run docs:sync`.

Wrapper plugin for Dockerfile linting via hadolint.

Missing `hadolint`: `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.
## Audits

- `hadolint-violations` — runs `hadolint` when available
## Usage

```ts
import dockerQuality from '@awesome-pushup-standards/docker-quality';

export default {
  plugins: [await dockerQuality({ rootDir: '.' })],
};
```
