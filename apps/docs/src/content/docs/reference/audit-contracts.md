---
title: Audit contracts
description: Matryca kontraktów audytów — rigor Base vs Strict, brak narzędzia vs naruszenie.
---

# Audit contracts

Wrapper plugins shell out to external CLIs (ruff, clippy, spectral, hadolint, …). When a tool is missing, the audit outcome must not be confused with a real code violation.

## Two layers

1. **Plugin** — returns `AuditOutput` (score + `displayValue`) based on `rigor`.
2. **Preset** — sets category `weight` so Base mode does not penalize onboarding; Strict mode treats missing CLI tools as failures.

See also [Scoring model](/reference/scoring-model/) and [Plugin authoring](/guides/plugin-authoring/).

## Rigor

| Value    | Use case                                        |
| -------- | ----------------------------------------------- |
| `base`   | Local collect while setting up the environment  |
| `strict` | CI / production-quality gate (conscious choice) |

Presets accept `rigor?: 'base' | 'strict'`. Defaults: `*-strict` presets → `strict`; stack presets (`rust-cli`, `react-app`, …) → `base`.

```ts
// Local onboarding
export default await rustCli({ rootDir: '.', rigor: 'base' });

// CI shield
export default await rustCli({ rootDir: '.', rigor: 'strict' });
```

## Contract matrix

| Outcome                 | Example               | Plugin score (base) | Plugin score (strict) | Base weight   | Strict weight |
| ----------------------- | --------------------- | ------------------- | --------------------- | ------------- | ------------- |
| OK                      | no cycles, deny OK    | 1                   | 1                     | > 0           | > 0           |
| Violation               | cycle, deny violation | 0                   | 0                     | > 0           | > 0           |
| Missing CLI tool        | ENOENT, no subcommand | 1 (`… — skipped`)   | 0 (`not installed`)   | 0             | > 0           |
| Missing project context | no Dockerfile         | 1 (`… — skipped`)   | 1                     | 0 or excluded | 0 or excluded |
| Optional feature        | LLM not configured    | 1 (`… — skipped`)   | 1                     | 0             | 0             |

**Important:** `weight: 0` alone does not fix Base UX — a `score: 0` audit still looks red in the audit list. Base requires **score 1 + skipped** at plugin level.

## HTTP analogy

- **Strict + score 0** — user chose strict mode; missing scanner is their / pipeline’s problem (4xx-style responsibility in CI).
- **E2E Docker missing tools** — platform bug (5xx). Caught by `e2e:rebuild` preflight, not by consumer `rigor`.

## Tool-dependent audits (by plugin)

| Plugin           | Tool-dependent audit slugs                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `python-quality` | `ruff-lint`, `type-errors`, `line-coverage`, `bandit-findings`, `dependency-vulnerabilities` |
| `rust-quality`   | `clippy-warnings`, `format-check`, `advisory-vulnerabilities`, `coverage`                    |
| `rust-modules`   | `module-cycles`, `banned-dependencies`                                                       |
| `cpp-quality`    | `clang-tidy-warnings`, `cppcheck-issues`, `format-violations`                                |
| `qt-quality`     | `clazy-warnings`                                                                             |
| `docker-quality` | `hadolint-violations`                                                                        |
| `api-openapi`    | `spectral-violations`                                                                        |
| `security-sast`  | `dependency-audit` (when pip-audit / cargo audit required)                                   |

Heuristic plugins (`docs-quality`, `architecture-rules`, …) keep the same weights in both rigor modes unless they wrap an external CLI.

## E2E

E2E fixtures always run in Docker with tools installed. Good fixture requires `minScore >= 0.9` on required audits — no skip on missing tools. See [E2E testing](/guides/e2e-testing/).

## Future work

- Alerting (Sentry/Slack) when E2E preflight fails
- GHA cache for E2E Docker layers
