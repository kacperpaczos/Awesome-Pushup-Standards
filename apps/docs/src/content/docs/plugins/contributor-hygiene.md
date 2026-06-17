---
title: 'contributor-hygiene'
description: 'Shift-left contributor checks: conventional commits, husky, prettier, knip.'
domain: 'CI/CD'
packageSlug: 'contributor-hygiene'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/contributor-hygiene/README.md'
---

> **Edit source:** [packages/plugins/contributor-hygiene/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/contributor-hygiene/README.md) — this page is synced by `npm run docs:sync`.

Shift-left contributor checks: conventional commits, husky, prettier, knip.

## Usage

```ts
import contributorHygiene from '@awesome-pushup-standards/contributor-hygiene';

export default {
  plugins: [await contributorHygiene({ rootDir: '.' })],
};
```
