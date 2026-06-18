# @awesome-pushup-standards/audit-contract

## 0.2.0

### Minor Changes

- 69074a9: Add `rigor: 'base' | 'strict'` contract for wrapper plugins and presets.

  - **Strict** (default for direct plugin use and `*-strict` presets): missing CLI tools return `score: 0`.
  - **Base** (default for stack presets): missing tools return `score: 1` with `… — skipped`; tool-dependent category weights are `0`.
  - New private package `@awesome-pushup-standards/audit-contract` with `toolMissingAudit` and `presetWeight` helpers.

  Migration: pass `rigor: 'strict'` in CI configs; local onboarding can use default `base` on stack presets.
