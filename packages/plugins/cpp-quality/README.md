# @awesome-pushup-standards/cpp-quality

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
