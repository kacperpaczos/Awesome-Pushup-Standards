# Scoring model

## Audit score

Each audit returns `score` between **0** and **1**:

| Pattern      | Example                                         |
| ------------ | ----------------------------------------------- |
| Binary       | ESLint: 1 if no errors, 0 otherwise             |
| Proportional | Coverage: `score = coverage_percent / 100`      |
| Heuristic    | Stack detector: 1 if tool present, 0 if missing |

`value` is the raw metric (issue count, percentage, etc.).

## Groups

Groups aggregate audits **within one plugin** using weighted `GroupRef`:

```ts
{ slug: 'problems', title: 'Problems', refs: [{ slug: 'some-audit', weight: 100 }] }
```

## Categories

Categories aggregate **across plugins** using `CategoryRef`:

```ts
{ type: 'audit', plugin: 'python-quality', slug: 'ruff-lint', weight: 40 }
```

Weight **0** = informational only, no impact on category score.

In `monorepo-ci-strict`, optional infrastructure (e.g. Nx Cloud remote cache, Codecov uploads) is not scored unless you add refs with weight > 0. Use weight **0** for audits that depend on org secrets such as `NX_CLOUD_ACCESS_TOKEN`.

## Quality leaps

Heuristic audits in `quality-leaps` categories are aspirational — they suggest adoption (pydantic, Zod, TypeScript) rather than penalize existing code errors.

Optional infrastructure audits (Nx Cloud, Codecov) should use weight **0** until implemented — see [monorepo-ci.md — TODO](monorepo-ci.md#todo--do-rozwazenia).

## Non-blocking philosophy

code-pushup provides visibility and trends. Presets set high standards without failing CI by default.
