# @awesome-pushup-standards/architecture-rules

## 1.0.0

### Major Changes

- abb6bce: **Breaking:** `layer-violations` audit now requires at least one actual rule in the `forbidden` array of `.dependency-cruiser.js`. An empty `forbidden: []` array no longer satisfies the check (score: 0).

  Additional improvements (non-breaking):

  - God-module threshold raised from 15 to 25 imports — barrel files with many re-exports no longer trigger false positives.
  - `index.*` barrel files are excluded from the god-module check entirely.

## 0.1.0

### Minor Changes

- ec464e2: Initial public release of code-pushup plugins and presets.
