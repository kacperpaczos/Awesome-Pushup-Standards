# Documentation site

[Starlight](https://starlight.astro.build/) app for project documentation.

## Commands

From the repo root:

```bash
npm run docs:dev      # http://localhost:4321
npm run docs:build    # static output in dist/
npm run docs:preview  # preview production build
```

Or from this directory: `npm run dev`, `npm run build`, `npm run preview`.

## Content

Markdown pages live in `src/content/docs/`. Sidebar and site metadata are configured in `astro.config.mjs`.

Mermaid diagrams use [astro-mermaid](https://www.npmjs.com/package/astro-mermaid) (integration must be listed before Starlight).
