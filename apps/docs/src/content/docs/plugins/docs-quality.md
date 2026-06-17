---
title: "docs-quality"
description: "Heuristic plugin checking repository documentation completeness."
domain: "Documentation"
packageSlug: "docs-quality"
packageKind: "plugin"
sourceReadme: "packages/plugins/docs-quality/README.md"
---

> **Edit source:** [packages/plugins/docs-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/docs-quality/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin checking repository documentation completeness.
## Usage

```ts
import docsQuality from '@awesome-pushup-standards/docs-quality';

export default {
  plugins: [await docsQuality({ rootDir: '.' })],
};
```
