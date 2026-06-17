import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import {
  DEFAULT_AUDIT_RIGOR,
  toolMissingAudit,
  type AuditRigor,
} from '@awesome-pushup-standards/audit-contract';
import { crawlFileSystem } from '@code-pushup/utils';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type RunnerOptions = {
  rootDir?: string;
  rigor?: AuditRigor;
};

const SPEC_NAMES = [
  'openapi.yaml',
  'openapi.yml',
  'openapi.json',
  'api/openapi.yaml',
  'api/openapi.json',
  'docs/openapi.yaml',
  'docs/openapi.json',
];

function findSpecPath(root: string): string | undefined {
  for (const name of SPEC_NAMES) {
    const path = join(root, name);
    if (existsSync(path)) return path;
  }
  return undefined;
}

async function runSpectral(specPath: string, cwd: string, rigor: AuditRigor): Promise<AuditOutput> {
  try {
    await execFileAsync('spectral', ['lint', specPath], {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    });
    return {
      slug: 'spectral-violations',
      value: 0,
      score: 1,
      displayValue: 'no spectral violations',
    };
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string };
    if (err.code === 'ENOENT') {
      return toolMissingAudit('spectral-violations', 'spectral', rigor);
    }
    const output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
    const violationCount = (output.match(/\berror\b/gi) ?? []).length || 1;
    return {
      slug: 'spectral-violations',
      value: violationCount,
      score: 0,
      displayValue: `spectral found issues`,
      details: {
        issues: [
          {
            message: 'spectral lint reported violations',
            severity: 'warning',
            source: { file: specPath, position: { startLine: 1 } },
          },
        ],
      },
    };
  }
}

function checkApiVersioning(specContent: string): AuditOutput {
  const hasVersion = /^\s*version\s*:/m.test(specContent) || /"version"\s*:/.test(specContent);
  const hasV1Path = /\/v\d+\//.test(specContent);
  const hasDeprecated = /deprecated\s*:\s*true/i.test(specContent);

  const ok = hasVersion && (hasV1Path || hasDeprecated);

  return {
    slug: 'api-versioning',
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? 'versioning signals present' : 'missing info.version or /v1/ paths',
    details: ok
      ? undefined
      : {
          issues: [
            {
              message: 'add info.version and URI path versioning (/v1/) or deprecated markers',
              severity: 'warning',
            },
          ],
        },
  };
}

async function hasCodeFirstSignals(root: string): Promise<boolean> {
  const dirs = ['src', 'app', 'lib'].map((d) => join(root, d)).filter((d) => existsSync(d));
  const patterns = [
    /@nestjs\/swagger/,
    /swagger-jsdoc/,
    /fastapi\.openapi/,
    /@openapi\(/,
    /createDocument\(/,
  ];

  for (const dir of dirs) {
    const files = await crawlFileSystem({
      directory: dir,
      pattern: /\.(ts|tsx|js|py)$/,
    });
    for (const file of files.slice(0, 40)) {
      const content = await readFile(file, 'utf8');
      if (patterns.some((p) => p.test(content))) return true;
    }
  }
  return false;
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';
  const rigor = options.rigor ?? DEFAULT_AUDIT_RIGOR;

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const specPath = findSpecPath(root);
    const hasSpec = Boolean(specPath);
    const specContent = specPath ? await readFile(specPath, 'utf8') : '';

    const spectral = hasSpec
      ? await runSpectral(specPath!, root, rigor)
      : {
          slug: 'spectral-violations' as const,
          value: 1,
          score: 0,
          displayValue: 'no spec — spectral skipped',
        };

    const versioning = hasSpec
      ? checkApiVersioning(specContent)
      : {
          slug: 'api-versioning' as const,
          value: 1,
          score: 0,
          displayValue: 'no spec file',
        };

    const codeFirst = await hasCodeFirstSignals(root);
    const schemaFirst = hasSpec && !codeFirst;

    return [
      {
        slug: 'has-openapi-spec',
        value: hasSpec ? 0 : 1,
        score: hasSpec ? 1 : 0,
        displayValue: hasSpec ? specPath! : 'missing — add openapi.yaml/json',
        details: hasSpec
          ? undefined
          : {
              issues: [
                {
                  message: 'add openapi.yaml or openapi.json at project root',
                  severity: 'warning',
                },
              ],
            },
      },
      spectral,
      versioning,
      {
        slug: 'schema-first',
        value: schemaFirst ? 0 : 1,
        score: schemaFirst ? 1 : codeFirst && !hasSpec ? 0 : hasSpec ? 1 : 0,
        displayValue: schemaFirst
          ? 'schema-first (spec without heavy code-first decorators)'
          : hasSpec
            ? 'spec present (code-first signals also detected)'
            : 'code-first or no spec',
        details:
          !hasSpec && codeFirst
            ? {
                issues: [
                  {
                    message: 'consider maintaining an OpenAPI spec file (schema-first)',
                    severity: 'warning',
                  },
                ],
              }
            : undefined,
      },
    ];
  };
}
