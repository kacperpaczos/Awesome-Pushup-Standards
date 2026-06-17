---
title: "cpp-qt-desktop"
description: "Preset for C++/Qt desktop projects: static analysis, Qt checks, security, docs, and optional Docker linting."
domain: "C++/Qt"
packageSlug: "cpp-qt-desktop"
packageKind: "preset"
sourceReadme: "packages/presets/cpp-qt-desktop/README.md"
---

> **Edit source:** [packages/presets/cpp-qt-desktop/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/presets/cpp-qt-desktop/README.md) — this page is synced by `npm run docs:sync`.

Preset for C++/Qt desktop projects: static analysis, Qt checks, security, docs, and optional Docker linting.
## Usage

```ts
import cppQtDesktop from '@awesome-pushup-standards/cpp-qt-desktop';

export default await cppQtDesktop({ rootDir: '.', includeDocker: true });
```
