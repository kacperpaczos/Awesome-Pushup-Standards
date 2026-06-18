---
title: "qt-quality"
description: "Heuristic Qt project checks with optional clazy detection."
domain: "Qt"
packageSlug: "qt-quality"
packageKind: "plugin"
sourceReadme: "packages/plugins/qt-quality/README.md"
---

> **Edit source:** [packages/plugins/qt-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/qt-quality/README.md) — this page is synced by `npm run docs:sync`.

Heuristic Qt project checks with optional clazy detection.

Missing `clazy` on PATH: `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.
## Audits

- `clazy-warnings` — detects `.clazy` or clazy in CMakeLists, or clazy on PATH
- `qt-api-misuse` — checks CMakeLists for Qt5/Qt6 and `.clang-tidy` for Qt checks
## Usage

```ts
import qtQuality from '@awesome-pushup-standards/qt-quality';

export default {
  plugins: [await qtQuality({ rootDir: '.' })],
};
```
