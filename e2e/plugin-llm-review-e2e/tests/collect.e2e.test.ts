import { createServer, type Server } from 'node:http';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  assertAllAuditsMinScore,
  assertNoSkippedRequired,
  cleanupE2eFixtureReports,
  getPluginReport,
  PLUGIN_CONTRACTS,
  runCollectInContainer,
} from '@awesome-pushup/e2e-utils';

const PLUGIN = 'llm-review';
const FIXTURE = 'e2e/plugin-llm-review-e2e/mocks/fixtures';
const CONTRACT = PLUGIN_CONTRACTS[PLUGIN];
const IMAGE = CONTRACT.image;

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
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: `${FIXTURE}/good`,
      image: IMAGE,
      env: { PUSHUP_LLM_ENDPOINT: endpoint, PUSHUP_LLM_MODEL: 'mock' },
    });
    expect(code).toBe(0);
    assertNoSkippedRequired(report, PLUGIN, CONTRACT.good.requiredAudits);
    assertAllAuditsMinScore(report, PLUGIN, CONTRACT.good.minScore, {
      skipInformational: true,
      skipUnavailable: true,
      excludeSlugs: CONTRACT.good.excludeSlugs,
    });
  });

  it('bad fixture skips without endpoint', async () => {
    const prev = process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_ENDPOINT;
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: `${FIXTURE}/bad`,
      image: IMAGE,
    });
    if (prev) process.env.PUSHUP_LLM_ENDPOINT = prev;
    expect(code).toBe(0);
    if (CONTRACT.bad.mode !== 'all-skipped') {
      throw new Error(`Unexpected bad contract mode for ${PLUGIN}`);
    }
    const plugin = getPluginReport(report, PLUGIN);
    expect(
      plugin.audits.every((a) => (a.displayValue ?? '').toLowerCase().includes('skipped')),
    ).toBe(true);
  });
});
