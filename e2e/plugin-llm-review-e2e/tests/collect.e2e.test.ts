import { createServer, type Server } from 'node:http';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  assertBadFixtureContract,
  assertGoodFixtureContract,
  cleanupE2eFixtureReports,
  fixtureRootForPlugin,
  runPluginContractCollect,
} from '@awesome-pushup/e2e-utils';

const PLUGIN = 'llm-review' as const;
const FIXTURE = fixtureRootForPlugin(PLUGIN);

describe('llm-review e2e', () => {
  let server: Server;
  let endpoint = '';

  beforeAll(async () => {
    server = createServer((_req, res) => {
      const body = JSON.stringify({
        dimensions: [
          { name: 'architecture', score: 5, justification: 'layering ok' },
          { name: 'naming', score: 5, justification: 'clear names' },
          { name: 'consistency', score: 5, justification: 'consistent style' },
          { name: 'modern-alternatives', score: 5, justification: 'modern APIs' },
          { name: 'readability', score: 5, justification: 'readable code' },
        ],
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          choices: [{ message: { content: body } }],
        }),
      );
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const addr = server.address();
    if (addr && typeof addr === 'object') {
      endpoint = `http://127.0.0.1:${addr.port}/v1/chat/completions`;
      process.env.PUSHUP_LLM_ENDPOINT = endpoint;
      process.env.PUSHUP_LLM_MODEL = 'mock';
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    delete process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_MODEL;
  });

  afterEach(async () => {
    await cleanupE2eFixtureReports(FIXTURE);
  });

  it('good fixture returns LLM scores', async () => {
    const { code, report } = await runPluginContractCollect({
      pluginSlug: PLUGIN,
      variant: 'good',
      env: { PUSHUP_LLM_ENDPOINT: endpoint, PUSHUP_LLM_MODEL: 'mock' },
    });
    expect(code).toBe(0);
    assertGoodFixtureContract(report, PLUGIN);
  });

  it('bad fixture skips without endpoint', async () => {
    const prev = process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_ENDPOINT;
    const { code, report } = await runPluginContractCollect({
      pluginSlug: PLUGIN,
      variant: 'bad',
    });
    if (prev) process.env.PUSHUP_LLM_ENDPOINT = prev;
    expect(code).toBe(0);
    assertBadFixtureContract(report, PLUGIN);
  });
});
