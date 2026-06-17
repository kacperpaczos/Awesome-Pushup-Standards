---
title: Domains
description: Domains — awesome-pushup-standards
---

# Domains

See [Plugins catalog](/reference/plugins-catalog/) for a full overview of what each plugin detects, its audits, configuration options, stack detector mappings, and preset composition.

| Domain         | Plugins                                                  | Status                                                                  |
| -------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Python         | `python-stack-detector`, `python-quality`                | Done                                                                    |
| Rust           | `rust-quality`, `rust-modules`                           | Done                                                                    |
| JS/TS          | `ts-stack-detector` + official ESLint/TS/coverage        | Done                                                                    |
| C++            | `cpp-quality`                                            | Done                                                                    |
| Qt             | `qt-quality`                                             | Done                                                                    |
| GTK/GNOME      | `gtk-style`                                              | Done                                                                    |
| Architecture   | `architecture-rules`                                     | Done                                                                    |
| API design     | `api-openapi`                                            | Done                                                                    |
| React          | `react-standards`                                        | Done                                                                    |
| Error handling | `error-logging`                                          | Done                                                                    |
| Security       | `security-sast`                                          | Done                                                                    |
| Docker         | `docker-quality`                                         | Done                                                                    |
| Documentation  | `docs-quality`                                           | Done — see [Documentation registry](/reference/documentation-registry/) |
| CI/CD          | `cicd-quality`, `contributor-hygiene`, `release-quality` | Done                                                                    |
| CI/CD roadmap  | —                                                        | [Deferred](/project/backlog/#deferred--odroczone)                       |
| LLM review     | `llm-review`                                             | Done                                                                    |

## Presets

| Preset                  | Status |
| ----------------------- | ------ |
| `python-backend-strict` | Done   |
| `react-app`             | Done   |
| `rust-cli`              | Done   |
| `cpp-qt-desktop`        | Done   |
| `gtk-desktop`           | Done   |
| `monorepo-ci-strict`    | Done   |

## Examples

| Example               | Preset                  |
| --------------------- | ----------------------- |
| `python-fastapi-demo` | `python-backend-strict` |
| `react-vite-demo`     | `react-app`             |
| `rust-cli-demo`       | `rust-cli`              |
| `cpp-qt-demo`         | `cpp-qt-desktop`        |
