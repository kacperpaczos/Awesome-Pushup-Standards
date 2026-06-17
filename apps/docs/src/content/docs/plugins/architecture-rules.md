---
title: "architecture-rules"
description: "Heuristic plugin for architecture fitness functions: forbidden imports, cycles, layers, and god modules."
domain: "Architecture"
packageSlug: "architecture-rules"
packageKind: "plugin"
sourceReadme: "packages/plugins/architecture-rules/README.md"
---

> **Edit source:** [packages/plugins/architecture-rules/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/architecture-rules/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin for architecture fitness functions: forbidden imports, cycles, layers, and god modules.
## Audits

- `forbidden-imports` — dependency-cruiser or import-linter configured
- `circular-dependencies` — same architecture tooling present
- `layer-violations` — layer rules in import-linter or dependency-cruiser
- `god-module` — no file in `src/` exceeds import line threshold (default 15)
## Usage

```ts
import architectureRules from '@awesome-pushup-standards/architecture-rules';

export default {
  plugins: [await architectureRules({ rootDir: '.', godModuleImportThreshold: 15 })],
};
```
