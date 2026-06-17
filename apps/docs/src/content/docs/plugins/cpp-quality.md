---
title: 'cpp-quality'
description: 'Wrapper plugin for C++ static analysis tools.'
domain: 'C++'
packageSlug: 'cpp-quality'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/cpp-quality/README.md'
---

> **Edit source:** [packages/plugins/cpp-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/cpp-quality/README.md) — this page is synced by `npm run docs:sync`.

Wrapper plugin for C++ static analysis tools.

Missing CLI tools: `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.

## Audits

- `clang-tidy-warnings` — runs `clang-tidy` when available
- `cppcheck-issues` — runs `cppcheck --enable=all` when available
- `format-violations` — runs `clang-format --dry-run` when available

## Usage

```ts
import cppQuality from '@awesome-pushup-standards/cpp-quality';

export default {
  plugins: [await cppQuality({ cwd: '.' })],
};
```
