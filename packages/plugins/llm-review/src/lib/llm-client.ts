import { llmResponseSchema, type LlmDimension } from './schema.js';

export type LlmConfig = {
  endpoint: string;
  apiKey?: string;
  model: string;
};

export function getLlmConfigFromEnv(): LlmConfig | null {
  const endpoint = process.env.PUSHUP_LLM_ENDPOINT;
  const model = process.env.PUSHUP_LLM_MODEL;
  if (!endpoint || !model) return null;
  return {
    endpoint,
    model,
    apiKey: process.env.PUSHUP_LLM_API_KEY,
  };
}

export async function callLlmReview(
  config: LlmConfig,
  codeSample: string,
): Promise<LlmDimension[]> {
  const body = {
    model: config.model,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You are a code reviewer. Return JSON only: { "dimensions": [{ "name": string, "score": 0-5, "justification": string }] }. Score architecture, naming, consistency, modern-alternatives, readability.',
      },
      {
        role: 'user',
        content: `Review this code sample:\n\n${codeSample.slice(0, 8000)}`,
      },
    ],
    response_format: { type: 'json_object' },
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? '{}';
  const parsed = llmResponseSchema.parse(JSON.parse(content));
  return parsed.dimensions;
}
