# @awesome-pushup-standards/error-logging

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
