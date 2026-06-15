# @awesome-pushup-standards/qt-quality

Heuristic Qt project checks with optional clazy detection.

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
