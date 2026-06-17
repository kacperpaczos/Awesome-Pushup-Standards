---
title: 'ts-stack-detector'
description: 'Heuristic plugin detecting TypeScript, Zod, and ESLint setup in JS/TS projects.'
domain: 'JS/TS'
packageSlug: 'ts-stack-detector'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/ts-stack-detector/README.md'
---

> **Edit source:** [packages/plugins/ts-stack-detector/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/ts-stack-detector/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin detecting TypeScript, Zod, and ESLint setup in JS/TS projects.

## Usage

```ts
import tsStackDetector from '@awesome-pushup-standards/ts-stack-detector';

export default {
  plugins: [await tsStackDetector()],
};
```
