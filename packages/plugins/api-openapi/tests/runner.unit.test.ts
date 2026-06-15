import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRunner } from '../src/runner.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

const SAMPLE_SPEC = `openapi: 3.0.0
info:
  title: Demo API
  version: 1.0.0
paths:
  /v1/users:
    get:
      summary: List users
      responses:
        '200':
          description: OK
`;

describe('api-openapi runner', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'api-openapi-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('scores high when openapi spec with versioning exists', async () => {
    await writeFile(join(dir, 'openapi.yaml'), SAMPLE_SPEC);

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const bySlug = Object.fromEntries(outputs.map((o) => [o.slug, o]));

    expect(bySlug['has-openapi-spec']?.score).toBe(1);
    expect(bySlug['api-versioning']?.score).toBe(1);
    expect(bySlug['schema-first']?.score).toBe(1);
  });

  it('scores low when no spec is present', async () => {
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'has-openapi-spec')?.score).toBe(0);
  });

  it('detects code-first signals without spec', async () => {
    const src = join(dir, 'src');
    await mkdir(src, { recursive: true });
    await writeFile(join(src, 'main.ts'), "import { DocumentBuilder } from '@nestjs/swagger';\n");

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'schema-first')?.score).toBe(0);
  });
});
