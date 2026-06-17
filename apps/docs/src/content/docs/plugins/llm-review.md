---
title: 'llm-review'
description: 'Optional LLM rubric review. Requires `PUSHUP_LLM_ENDPOINT`, `PUSHUP_LLM_MODEL`, and optionally `PUSHUP_LLM_API_KEY`.'
domain: 'LLM review'
packageSlug: 'llm-review'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/llm-review/README.md'
---

> **Edit source:** [packages/plugins/llm-review/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/llm-review/README.md) — this page is synced by `npm run docs:sync`.

Optional LLM rubric review. Requires `PUSHUP_LLM_ENDPOINT`, `PUSHUP_LLM_MODEL`, and optionally `PUSHUP_LLM_API_KEY`.

Gracefully skips when not configured (`isSkipped: true`).

```ts
import llmReview from '@awesome-pushup-standards/llm-review';
export default { plugins: [await llmReview()] };
```
