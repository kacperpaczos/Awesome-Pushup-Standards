---
title: "error-logging"
description: "Heuristic plugin for error handling and logging standards across Python and JS/TS."
domain: "Error handling"
packageSlug: "error-logging"
packageKind: "plugin"
sourceReadme: "packages/plugins/error-logging/README.md"
---

> **Edit source:** [packages/plugins/error-logging/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/error-logging/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin for error handling and logging standards across Python and JS/TS.
## Audits

- `bare-except` — no bare `except:` in Python files
- `structured-logging` — `logging` import in Python or `winston`/`pino` in package.json
- `no-print-debug` — no `console.log` in `src/` (test files excluded)
## Usage

```ts
import errorLogging from '@awesome-pushup-standards/error-logging';

export default {
  plugins: [await errorLogging({ rootDir: '.' })],
};
```
