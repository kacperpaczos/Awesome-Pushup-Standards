# Documentation site

[Starlight](https://starlight.astro.build/) wiki for awesome-pushup-standards.

## Commands (from repo root)

```bash
npm run docs:sync     # sync packages/*/README.md → Starlight + registry
npm run docs:verify   # sync + assert generated files match git
npm run docs:dev      # sync + http://localhost:4321
npm run docs:build    # sync + static build → apps/docs/dist/
npm run docs:preview  # preview production build
```

Or from this directory: `npm run dev`, `npm run build`, `npm run preview` (run `docs:sync` from root first).

## Content layout

| Path                                                                         | Source                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/content/docs/guides/`                                                   | Hand-written guides                                    |
| `src/content/docs/project/`                                                  | Backlog, vision, monorepo CI                           |
| `src/content/docs/plugins/`, `presets/`                                      | **Generated** from `packages/*/README.md`              |
| `src/content/docs/reference/documentation-registry.md`, `plugins-catalog.md` | **Generated** by `scripts/sync-docs-to-starlight.mjs`  |
| `doc-registry.json`, `sidebar.generated.mjs`                                 | **Generated** (sidebar imported in `astro.config.mjs`) |

CI runs `docs:verify` and link checks on the built site. See [Contributing — documentation workflow](/guides/contributing/#documentation-workflow).

Mermaid diagrams use [astro-mermaid](https://www.npmjs.com/package/astro-mermaid) (integration must be listed before Starlight in `astro.config.mjs`).
