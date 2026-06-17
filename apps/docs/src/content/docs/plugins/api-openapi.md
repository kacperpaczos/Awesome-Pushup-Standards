---
title: 'api-openapi'
description: 'Heuristic plugin for OpenAPI spec presence, Spectral linting, API versioning, and schema-first design.'
domain: 'API design'
packageSlug: 'api-openapi'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/api-openapi/README.md'
---

> **Edit source:** [packages/plugins/api-openapi/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/api-openapi/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin for OpenAPI spec presence, Spectral linting, API versioning, and schema-first design.

Missing Spectral CLI: `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.

## Audits

- `has-openapi-spec` — `openapi.yaml` / `openapi.json` exists
- `spectral-violations` — runs `spectral lint` when Spectral CLI is installed
- `api-versioning` — `info.version` and `/v1/` paths or `deprecated` markers
- `schema-first` — spec file present without heavy code-first decorator signals

## Usage

```ts
import apiOpenapi from '@awesome-pushup-standards/api-openapi';

export default {
  plugins: [await apiOpenapi({ rootDir: '.' })],
};
```
