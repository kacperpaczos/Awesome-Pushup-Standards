import { spawn } from 'node:child_process';
import { dockerUserFlag } from './docker-user.js';
import type { E2eImage } from './docker.js';

export type DockerRunResult = {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  command: string;
};

function dockerUserArgs(): string[] {
  const flag = dockerUserFlag().trim();
  if (!flag) return [];
  return flag.split(/\s+/);
}

function formatDockerCommand(args: string[]): string {
  return ['docker', ...args]
    .map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
    .join(' ');
}

export function buildDockerRunArgs(options: {
  image: E2eImage;
  fixtureAbs: string;
  repoRoot: string;
  env: Record<string, string>;
  shellCmd: string;
}): string[] {
  return [
    'run',
    '--rm',
    ...dockerUserArgs(),
    '-v',
    `${options.repoRoot}:${options.repoRoot}`,
    '-w',
    options.fixtureAbs,
    '--network',
    'host',
    ...Object.entries(options.env).flatMap(([key, value]) => ['-e', `${key}=${value}`]),
    options.image,
    'bash',
    '-c',
    options.shellCmd,
  ];
}

export async function runDockerShellCommand(options: {
  image: E2eImage;
  fixtureAbs: string;
  repoRoot: string;
  env: Record<string, string>;
  shellCmd: string;
  timeoutMs?: number;
}): Promise<DockerRunResult> {
  const args = buildDockerRunArgs(options);
  const command = formatDockerCommand(args);
  const timeoutMs = options.timeoutMs ?? 180_000;

  return new Promise((resolve, reject) => {
    const proc = spawn('docker', args, { shell: false, windowsHide: true });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
    }, timeoutMs);

    proc.stdout.on('data', (chunk: Buffer | string) => {
      stdout += String(chunk);
    });

    proc.stderr.on('data', (chunk: Buffer | string) => {
      stderr += String(chunk);
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    proc.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`Docker command timed out after ${timeoutMs}ms: ${command}`));
        return;
      }
      resolve({ code, signal, stdout, stderr, command });
    });
  });
}
