import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import type { Report } from '@code-pushup/models';
import { executeProcess, ProcessError } from '@code-pushup/utils';
import { assertCollectResultIsFresh } from './assert-collect.js';
import {
  appendCollectLogSection,
  nextCollectLogIndex,
  shouldWriteCollectLog,
} from './collect-log.js';
import { dockerUserFlag } from './docker-user.js';
import { fixtureLogDir } from './fixture-log-dir.js';
import { findRepoRoot } from './find-repo-root.js';
import { isDockerAvailable, dockerRuntimeEnv, type E2eImage } from './docker.js';
import { runDockerShellCommand } from './docker-run.js';
import { readReport, reportPathForLogDir } from './report.js';
import { PLUGIN_CONTRACTS, type PluginSlug } from './plugin-contracts.js';
import {
  assertToolPreflightOk,
  runToolPreflightInContainer,
  type ToolPreflightResult,
} from './tool-preflight.js';

const DEFAULT_DOCKER_TIMEOUT_MS = 180_000;

export type RunCollectOptions = {
  fixtureRelPath: string;
  image: E2eImage;
  pluginSlug?: PluginSlug;
  repoRoot?: string;
  env?: Record<string, string>;
};

function dockerTimeoutMs(): number {
  const raw = process.env.E2E_DOCKER_TIMEOUT_MS;
  if (!raw) return DEFAULT_DOCKER_TIMEOUT_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DOCKER_TIMEOUT_MS;
}

function collectArgs(verbose: boolean, persistOutputDir: string): string[] {
  const args = [
    'code-pushup',
    'collect',
    '--config',
    'code-pushup.config.ts',
    `--persist.outputDir=${persistOutputDir}`,
  ];
  if (verbose) args.push('--verbose');
  return args;
}

function emptyReport(): Report {
  return { plugins: [], categories: [], score: 0, date: new Date().toISOString() };
}

export async function runCollectInContainer(options: RunCollectOptions) {
  const repoRoot = options.repoRoot ?? findRepoRoot();
  const fixtureAbs = join(repoRoot, options.fixtureRelPath);
  const logDir = fixtureLogDir(options.fixtureRelPath, repoRoot);
  const persistOutputDir = join(logDir, '.code-pushup');
  const reportPath = reportPathForLogDir(logDir);
  const verbose = shouldWriteCollectLog();
  const startedAt = Date.now();

  await rm(join(fixtureAbs, '.code-pushup'), { recursive: true, force: true }).catch(() => {});
  await rm(persistOutputDir, { recursive: true, force: true }).catch(() => {});
  await mkdir(persistOutputDir, { recursive: true });

  const dockerOk = await isDockerAvailable();
  const useDocker = dockerOk && process.env.E2E_USE_DOCKER !== '0';

  const npmCache = `/tmp/npm-cache-e2e-${process.pid}-${Date.now()}`;
  const llmEnv = options.env ?? {};
  const dockerHome = dockerUserFlag() ? { HOME: '/tmp' } : {};
  const envPairs = Object.entries({
    ...dockerRuntimeEnv({
      NPM_CONFIG_CACHE: npmCache,
      CP_PERSIST_OUTPUT_DIR: persistOutputDir,
      ...dockerHome,
      ...llmEnv,
      ...(process.env.PUSHUP_LLM_ENDPOINT
        ? {
            PUSHUP_LLM_ENDPOINT: process.env.PUSHUP_LLM_ENDPOINT,
            PUSHUP_LLM_MODEL: process.env.PUSHUP_LLM_MODEL ?? 'mock',
          }
        : {}),
    }),
  });

  let code = 1;
  let signal: string | null = null;
  let stdout = '';
  let stderr = '';
  let command = '';
  let report: Report = emptyReport();
  let collectError: unknown;
  let toolPreflight: ToolPreflightResult[] = [];

  const contractTools =
    options.pluginSlug !== undefined ? PLUGIN_CONTRACTS[options.pluginSlug].tools : [];

  const capture = {
    onStdout: (chunk: string) => {
      stdout += chunk;
    },
    onStderr: (chunk: string) => {
      stderr += chunk;
    },
  };

  try {
    if (useDocker && contractTools.length > 0) {
      toolPreflight = await runToolPreflightInContainer({
        fixtureAbs,
        image: options.image,
        tools: contractTools,
        repoRoot,
        env: llmEnv,
        timeoutMs: dockerTimeoutMs(),
      });
      assertToolPreflightOk(toolPreflight, {
        fixtureRelPath: options.fixtureRelPath,
        image: options.image,
      });
    }

    if (useDocker) {
      const collectCmd = ['npx', ...collectArgs(verbose, persistOutputDir)].join(' ');
      const shellCmd = [
        `git config --global --add safe.directory ${JSON.stringify(repoRoot)}`,
        collectCmd,
      ].join(' && ');
      const dockerEnv = Object.fromEntries(envPairs);
      const dockerResult = await runDockerShellCommand({
        image: options.image,
        fixtureAbs,
        repoRoot,
        env: dockerEnv,
        shellCmd,
        timeoutMs: dockerTimeoutMs(),
      });
      command = dockerResult.command;
      code = dockerResult.code ?? 1;
      signal = dockerResult.signal;
      stdout = dockerResult.stdout || stdout;
      stderr = dockerResult.stderr || stderr;
    } else {
      command = ['npx', ...collectArgs(verbose, persistOutputDir)].join(' ');
      const result = await executeProcess({
        command: 'npx',
        args: collectArgs(verbose, persistOutputDir),
        cwd: fixtureAbs,
        env: {
          ...process.env,
          NPM_CONFIG_CACHE: npmCache,
          CP_PERSIST_OUTPUT_DIR: persistOutputDir,
          ...llmEnv,
        },
        timeout: dockerTimeoutMs(),
        silent: true,
        observer: capture,
      });
      code = result.code ?? 1;
      signal = result.signal;
      stdout = result.stdout || stdout;
      stderr = result.stderr || stderr;
    }

    report = await readReport(reportPath);
  } catch (error) {
    collectError = error;
    if (error instanceof ProcessError) {
      code = error.code ?? 1;
      signal = error.signal;
      stdout = error.stdout || stdout;
      stderr = error.stderr || stderr;
    }
  } finally {
    if (collectError instanceof ProcessError && collectError.signal === 'SIGTERM') {
      stderr = [stderr, `Timed out after ${dockerTimeoutMs()}ms`].filter(Boolean).join('\n');
    } else if (collectError instanceof Error) {
      stderr = [stderr, collectError.message].filter(Boolean).join('\n');
    }

    await appendCollectLogSection({
      index: nextCollectLogIndex(),
      fixtureRelPath: options.fixtureRelPath,
      image: options.image,
      command,
      usedDocker: useDocker,
      exitCode: code,
      signal,
      durationMs: Date.now() - startedAt,
      stdout,
      stderr,
      reportPath,
      report,
      toolPreflight,
    });
  }

  if (collectError instanceof ProcessError && collectError.signal === 'SIGTERM') {
    throw new Error(
      `Docker collect timed out after ${dockerTimeoutMs()}ms for ${options.fixtureRelPath} (${options.image})`,
      { cause: collectError },
    );
  }
  if (collectError instanceof Error && collectError.message.includes('Docker command timed out')) {
    throw new Error(
      `Docker collect timed out after ${dockerTimeoutMs()}ms for ${options.fixtureRelPath} (${options.image})`,
      { cause: collectError },
    );
  }
  if (collectError) throw collectError;

  await assertCollectResultIsFresh({
    fixtureRelPath: options.fixtureRelPath,
    image: options.image,
    reportPath,
    startedAt,
    stdout,
    stderr,
  });
  report = await readReport(reportPath);

  return { code, report, reportPath, usedDocker: useDocker, toolPreflight };
}
