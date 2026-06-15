# @awesome-pushup-standards/llm-review

Optional LLM rubric review. Requires `PUSHUP_LLM_ENDPOINT`, `PUSHUP_LLM_MODEL`, and optionally `PUSHUP_LLM_API_KEY`.

Gracefully skips when not configured (`isSkipped: true`).

```ts
import llmReview from '@awesome-pushup-standards/llm-review';
export default { plugins: [await llmReview()] };
```
