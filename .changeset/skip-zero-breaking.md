---
'@awesome-pushup-standards/python-quality': major
'@awesome-pushup-standards/cpp-quality': major
'@awesome-pushup-standards/rust-quality': major
'@awesome-pushup-standards/docker-quality': major
'@awesome-pushup-standards/qt-quality': major
'@awesome-pushup-standards/api-openapi': major
'@awesome-pushup-standards/rust-modules': major
'@awesome-pushup-standards/security-sast': major
---

**Breaking (strict rigor only):** audits return `score: 0` when a required external tool is not installed and `rigor` is `'strict'` (the default when calling plugins directly).

With `rigor: 'base'`, missing tools return `score: 1` and `displayValue` containing `skipped`. See [Audit contracts](/reference/audit-contracts/).

Previously, missing tools silently passed with a perfect score. Migration: use `rigor: 'strict'` in CI or install required tools.
