import { describe, expect, it } from 'vitest';
import { getLlmConfigFromEnv } from '../src/lib/llm-client.js';
import { createRunner } from '../src/runner.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('llm-review', () => {
  it('gracefully skips when LLM not configured', async () => {
    const prevEndpoint = process.env.PUSHUP_LLM_ENDPOINT;
    const prevModel = process.env.PUSHUP_LLM_MODEL;
    delete process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_MODEL;

    const outputs = await createRunner({ rootDir: '.', sourceDir: 'src' })(runnerArgs);
    expect(outputs.every((o) => o.displayValue?.includes('skipped'))).toBe(true);

    if (prevEndpoint) process.env.PUSHUP_LLM_ENDPOINT = prevEndpoint;
    if (prevModel) process.env.PUSHUP_LLM_MODEL = prevModel;
  });

  it('reads LLM config from environment variables', () => {
    process.env.PUSHUP_LLM_ENDPOINT = 'http://127.0.0.1:8080/v1/chat/completions';
    process.env.PUSHUP_LLM_MODEL = 'mock-model';
    process.env.PUSHUP_LLM_API_KEY = 'test-key';

    expect(getLlmConfigFromEnv()).toEqual({
      endpoint: 'http://127.0.0.1:8080/v1/chat/completions',
      model: 'mock-model',
      apiKey: 'test-key',
    });

    delete process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_MODEL;
    delete process.env.PUSHUP_LLM_API_KEY;
  });
});
