---
title: "cicd-quality"
description: "Heuristic plugin for GitHub Actions workflow quality."
domain: "CI/CD"
packageSlug: "cicd-quality"
packageKind: "plugin"
sourceReadme: "packages/plugins/cicd-quality/README.md"
---

> **Edit source:** [packages/plugins/cicd-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/cicd-quality/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin for GitHub Actions workflow quality.
## Audits

- `ci-present` — `.github/workflows` contains workflow files
- `actions-pinned` — majority of `uses:` references pinned to commit SHA (score 1 if majority SHA)
- `dependency-scanning-in-ci` — trivy, pip-audit, npm audit, or grype in workflows
## Usage

```ts
import cicdQuality from '@awesome-pushup-standards/cicd-quality';

export default {
  plugins: [await cicdQuality({ rootDir: '.' })],
};
```
