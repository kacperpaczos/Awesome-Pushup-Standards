import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem } from '@code-pushup/utils';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { callLlmReview, getLlmConfigFromEnv } from './lib/llm-client.js';
import { RUBRIC_DIMENSIONS } from './lib/schema.js';

export type RunnerOptions = {
  rootDir?: string;
  sourceDir?: string;
};

const SLUG_MAP: Record<string, string> = {
  architecture: 'architecture-review',
  naming: 'naming-review',
  consistency: 'consistency-review',
  'modern-alternatives': 'modern-alternatives',
  readability: 'readability-review',
};

function skippedOutputs(): AuditOutputs {
  return [
    {
      slug: 'architecture-review',
      value: 0,
      score: 1,
      displayValue: 'LLM not configured — skipped',
      details: {
        issues: [
          {
            message: 'Set PUSHUP_LLM_ENDPOINT and PUSHUP_LLM_MODEL to enable LLM review',
            severity: 'info',
          },
        ],
      },
    },
    {
      slug: 'naming-review',
      value: 0,
      score: 1,
      displayValue: 'LLM not configured — skipped',
    },
    {
      slug: 'consistency-review',
      value: 0,
      score: 1,
      displayValue: 'LLM not configured — skipped',
    },
    {
      slug: 'modern-alternatives',
      value: 0,
      score: 1,
      displayValue: 'LLM not configured — skipped',
    },
    {
      slug: 'readability-review',
      value: 0,
      score: 1,
      displayValue: 'LLM not configured — skipped',
    },
  ];
}

async function sampleCode(root: string, sourceDir: string): Promise<string> {
  const dir = join(root, sourceDir);
  const files = await crawlFileSystem({ directory: dir, pattern: /\.(ts|tsx|py|rs)$/ }).catch(
    () => [] as string[],
  );
  const chunks: string[] = [];
  for (const file of files.slice(0, 10)) {
    chunks.push(await readFile(file, 'utf8'));
  }
  return chunks.join('\n\n---\n\n');
}

function dimensionToAudit(dim: {
  name: string;
  score: number;
  justification: string;
}): AuditOutput {
  const key = dim.name.toLowerCase().replace(/\s+/g, '-');
  const slug = SLUG_MAP[key] ?? 'readability-review';
  const score = dim.score / 5;
  return {
    slug,
    value: dim.score,
    score,
    displayValue: `${dim.score}/5`,
    details: {
      issues: [{ message: dim.justification, severity: 'info' }],
    },
  };
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';
  const sourceDir = options.sourceDir ?? 'src';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const config = getLlmConfigFromEnv();
    if (!config) return skippedOutputs();

    try {
      const code = await sampleCode(root, sourceDir);
      if (!code.trim()) return skippedOutputs();

      const dimensions = await callLlmReview(config, code);
      const outputs = dimensions.map(dimensionToAudit);

      for (const expected of RUBRIC_DIMENSIONS) {
        const slug = SLUG_MAP[expected];
        if (!outputs.some((o) => o.slug === slug)) {
          outputs.push({
            slug,
            value: 0,
            score: 0,
            displayValue: 'no LLM score',
          });
        }
      }

      return outputs;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'LLM review failed';
      return [
        {
          slug: 'architecture-review',
          value: 0,
          score: 1,
          displayValue: 'LLM error — skipped',
          details: { issues: [{ message, severity: 'warning' }] },
        },
        ...skippedOutputs().slice(1),
      ];
    }
  };
}
