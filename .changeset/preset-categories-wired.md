---
'@awesome-pushup-standards/react-app': minor
'@awesome-pushup-standards/rust-cli': minor
'@awesome-pushup-standards/cpp-qt-desktop': minor
'@awesome-pushup-standards/gtk-desktop': minor
'@awesome-pushup-standards/python-backend-strict': minor
---

All presets now wire every loaded plugin into a scoring category. Previously, `security-sast`, `architecture-rules`, `docs-quality`, `coverage`, and `docker-quality` were loaded but orphaned — they collected data without contributing to any score.

New categories added per preset:

- **react-app**: `security` (security-sast), `architecture` (architecture-rules), `test-coverage` (coverage)
- **rust-cli**: `security` (security-sast + rust-quality advisory), `documentation` (docs-quality)
- **cpp-qt-desktop**: `security` (security-sast), `documentation` (docs-quality), `deployment` (docker-quality, when `includeDocker: true`)
- **gtk-desktop**: `security` (security-sast), `documentation` (docs-quality)
- **python-backend-strict**: `security` now includes python-quality bandit/dependency audits; `deployment` (docker-quality) added
