# awesome-pushup-standards

**code-pushup as the guru orchestrating every quality tool.**

Curated plugins and presets for [code-pushup](https://github.com/code-pushup/cli) CLI — one scoreboard for ruff, ESLint, clippy, Spectral, hadolint, and more.

## Documentation (wiki)

Full project documentation lives in the **Starlight wiki** under `apps/docs/`:

```bash
npm run docs:dev    # http://localhost:4321
npm run docs:build  # sync package READMEs + static build
```

| Topic                  | Wiki page                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Getting started        | [guides/getting-started](apps/docs/src/content/docs/guides/getting-started.md)                     |
| All plugins & presets  | Sidebar → Plugins / Presets (synced from `packages/*/README.md`)                                   |
| Documentation registry | [reference/documentation-registry](apps/docs/src/content/docs/reference/documentation-registry.md) |
| E2E contract tests     | [guides/e2e-testing](apps/docs/src/content/docs/guides/e2e-testing.md)                             |
| Contributing           | [guides/contributing](apps/docs/src/content/docs/guides/contributing.md)                           |
| Backlog                | [project/backlog](apps/docs/src/content/docs/project/backlog.md)                                   |
| Project vision         | [project/vision](apps/docs/src/content/docs/project/vision.md)                                     |

## Quick start

```bash
npm install -D @awesome-pushup-standards/monorepo-ci-strict @code-pushup/cli
```

```ts
import monorepoCiStrict from '@awesome-pushup-standards/monorepo-ci-strict';
export default await monorepoCiStrict({ rootDir: '.' });
```

```bash
npx code-pushup collect
```

## Development

```bash
npm ci && npm run build
npm run test:all
npm run docs:verify   # after packages/*/README.md changes
npm run e2e:rebuild   # Docker images + 38 E2E collects
npm run pushup        # smoke: full monorepo preset
```

Reference submodules (optional): [code-pushup/cli](https://github.com/code-pushup/cli), [community-plugins](https://github.com/code-pushup/community-plugins).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) or the [wiki contributing guide](apps/docs/src/content/docs/guides/contributing.md).

## License

MIT
