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

Execute external CLI tools (ruff, ESLint). Gracefully skip when tool is missing.

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

## References

- [code-pushup custom plugins](https://github.com/code-pushup/cli/blob/main/packages/cli/docs/custom-plugins.md)
- [models reference](https://github.com/code-pushup/cli/blob/main/packages/models/docs/models-reference.md)
- [community plugin-knip](https://github.com/code-pushup/community-plugins/tree/main/packages/plugin-knip)
