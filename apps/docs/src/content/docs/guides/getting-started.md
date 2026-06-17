---
title: Getting started
description: Install code-pushup, pick a preset, and run your first collect.
---

# Getting started

**awesome-pushup-standards** wraps ruff, ESLint, clippy, Spectral, hadolint, and more into a single [code-pushup](https://github.com/code-pushup/cli) scoreboard. Presets ship ready-made weights; plugins expose audits (0–1), groups, and weighted categories.

## Philosophy

1. **Orchestration, not reinvention** — wrap existing quality tools; code-pushup aggregates scores.
2. **Presets raise the bar** — e.g. `python-backend-strict`, `react-app`, `monorepo-ci-strict`.
3. **Quality leaps** — heuristic plugins suggest pydantic, Zod, TypeScript adoption.
4. **Non-blocking** — visibility and trends, not arbitrary CI pass/fail gates. See [Scoring model](/reference/scoring-model/).

## Install

```bash
npm install -D @awesome-pushup-standards/python-backend-strict @code-pushup/cli
```

Pick any plugin or preset from the [Documentation registry](/reference/documentation-registry/) or browse [Plugins](/plugins/python-quality/) / [Presets](/presets/monorepo-ci-strict/).

## Quick start

Monorepo CI preset (this repo dogfoods it):

```ts
// code-pushup.config.ts
import monorepoCiStrict from '@awesome-pushup-standards/monorepo-ci-strict';

export default await monorepoCiStrict({ rootDir: '.' });
```

Python backend:

```ts
import pythonBackendStrict from '@awesome-pushup-standards/python-backend-strict';

export default await pythonBackendStrict();
```

```bash
npx code-pushup collect
```

## Single plugin

```ts
import pythonQuality from '@awesome-pushup-standards/python-quality';

export default {
  plugins: [await pythonQuality({ cwd: '.' })],
};
```

See per-package pages under **Plugins** and **Presets** in the sidebar.

## Local development (this repo)

```bash
git clone --recurse-submodules https://github.com/kacperpaczos/Awesome-Pushup-Standards.git
cd Awesome-Pushup-Standards
npm ci && npm run build
npm run test:all
npm run e2e:images && npm run e2e
npm run pushup
```

Documentation site: `npm run docs:dev` → [http://localhost:4321](http://localhost:4321).

## Next steps

- [Plugin authoring](/guides/plugin-authoring/) — create a new plugin
- [E2E testing](/guides/e2e-testing/) — contract tests for plugins
- [Domains](/reference/domains/) — implementation status by area
- [Contributing](/guides/contributing/) — PR workflow
