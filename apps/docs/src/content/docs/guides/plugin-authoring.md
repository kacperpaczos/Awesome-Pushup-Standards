---
title: Plugin authoring
description: Plugin authoring — awesome-pushup-standards
---

# Plugin authoring

## Plugin types

### Heuristic (RunnerFunction)

Read project files and return binary scores. Use for presence/absence checks.

```ts
import type { PluginConfig, RunnerArgs, AuditOutputs } from '@code-pushup/models';

export async function create(): Promise<PluginConfig> {
  return {
    slug: 'my-detector',
    title: 'My detector',
    icon: 'search',
    audits: [{ slug: 'has-foo', title: 'Has foo' }],
    runner: async (_args: RunnerArgs): Promise<AuditOutputs> => [
      { slug: 'has-foo', value: 0, score: 1, displayValue: 'present' },
    ],
  };
}
```

### Wrapper (RunnerFunction or RunnerConfig)

Execute external CLI tools (ruff, ESLint). When a tool is missing, behaviour depends on `rigor` — see [Audit contracts](/reference/audit-contracts/).

## Slug rules

- Pattern: `/^[a-z\d]+(?:-[a-z\d]+)*$/`
- Max 128 characters
- English kebab-case only

## Package layout

```
packages/plugins/<slug>/
├── src/index.ts      # export default create
├── src/audits.ts
├── src/runner.ts
├── tests/
└── README.md
```

## Testing

Use Vitest with fixtures in `tests/fixtures/`. Mock filesystem with temp dirs for integration-style tests.

## Documentation

Each plugin needs:

1. `packages/plugins/<slug>/README.md` — usage snippet (source of truth for npm).
2. Domain entry in `scripts/sync-docs-to-starlight.mjs` (`PLUGIN_DOMAINS`).
3. Run `npm run docs:sync` — creates `plugins/<slug>` Starlight page and [Documentation registry](/reference/documentation-registry/) row.

Presets follow the same pattern under `packages/presets/` and `PRESET_DOMAINS`.

## References

- [code-pushup custom plugins](https://github.com/code-pushup/cli/blob/main/packages/cli/docs/custom-plugins.md)
- [models reference](https://github.com/code-pushup/cli/blob/main/packages/models/docs/models-reference.md)
- [community plugin-knip](https://github.com/code-pushup/community-plugins/tree/main/packages/plugin-knip)
