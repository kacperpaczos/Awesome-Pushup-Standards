---
title: 'security-sast'
description: 'Security plugin covering secrets scanning config, dependency audits, SAST tooling, and SBOM CI checks.'
domain: 'Security'
packageSlug: 'security-sast'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/security-sast/README.md'
---

> **Edit source:** [packages/plugins/security-sast/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/security-sast/README.md) — this page is synced by `npm run docs:sync`.

Security plugin covering secrets scanning config, dependency audits, SAST tooling, and SBOM CI checks.

Missing dependency audit CLI (`pip-audit`, `cargo audit`): `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.

## Usage

```ts
import securitySast from '@awesome-pushup-standards/security-sast';

export default {
  plugins: [await securitySast({ rootDir: '.' })],
};
```
