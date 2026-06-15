# LLM configuration

The `llm-review` plugin is **optional**. Without configuration it sets `isSkipped: true` and never breaks CI.

## Environment variables

| Variable              | Required | Description                               |
| --------------------- | -------- | ----------------------------------------- |
| `PUSHUP_LLM_ENDPOINT` | Yes      | OpenAI-compatible chat completions URL    |
| `PUSHUP_LLM_MODEL`    | Yes      | Model name (e.g. `gpt-4o-mini`, `llama3`) |
| `PUSHUP_LLM_API_KEY`  | No       | Bearer token for authenticated APIs       |

## Rubric

Each dimension is scored 0–5:

- Architecture and layering
- Naming quality
- Consistency
- Modern alternatives
- Readability

Audit `score` = dimension score / 5. Overall normalization: `sum(scores) / (5 × dimensions.length)`.

## Structured output

The plugin requests `response_format: { type: 'json_object' }` and validates with Zod:

```json
{
  "dimensions": [{ "name": "architecture", "score": 4, "justification": "..." }]
}
```

## Local models

Ollama and vLLM expose OpenAI-compatible endpoints. Set `PUSHUP_LLM_ENDPOINT` to e.g. `http://localhost:11434/v1/chat/completions`.

## Determinism

- Temperature: 0
- Cache: future enhancement via code-pushup runner cache flags

## Usage

```bash
export PUSHUP_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
export PUSHUP_LLM_API_KEY=sk-...
export PUSHUP_LLM_MODEL=gpt-4o-mini
npx code-pushup collect --onlyPlugins llm-review
```
