---
title: 'release-quality'
description: 'Release and supply-chain CD checks: OIDC npm publish, separated workflows, SECURITY.md.'
domain: 'CI/CD'
packageSlug: 'release-quality'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/release-quality/README.md'
---

> **Edit source:** [packages/plugins/release-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/release-quality/README.md) — this page is synced by `npm run docs:sync`.

Release and supply-chain CD checks: OIDC npm publish, separated workflows, SECURITY.md.

## Usage

```ts
import releaseQuality from '@awesome-pushup-standards/release-quality';

export default {
  plugins: [await releaseQuality({ rootDir: '.' })],
};
```
