import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

let cached: boolean | undefined;

export async function isDockerAvailable(): Promise<boolean> {
  if (cached !== undefined) return cached;
  try {
    await execFileAsync('docker', ['info'], { timeout: 10_000 });
    cached = true;
  } catch {
    cached = false;
  }
  return cached;
}

export const E2E_IMAGES = {
  node: 'e2e-node:20',
  python: 'e2e-python:3.12',
  rust: 'e2e-rust:1.83',
  cpp: 'e2e-cpp:qt',
  gtk: 'e2e-gtk:c',
  security: 'e2e-security',
} as const;

export type E2eImage = (typeof E2E_IMAGES)[keyof typeof E2E_IMAGES];

/** Docker resets PATH for --user; include toolchain locations explicitly. */
export const E2E_DOCKER_PATH =
  '/usr/local/cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';

const E2E_TOOL_CACHE_DIR = '/tmp/e2e-tool-cache';

export function dockerRuntimeEnv(extra: Record<string, string> = {}): Record<string, string> {
  return {
    PATH: E2E_DOCKER_PATH,
    CARGO_HOME: '/usr/local/cargo',
    RUSTUP_HOME: '/usr/local/rustup',
    RUFF_CACHE_DIR: E2E_TOOL_CACHE_DIR,
    MYPY_CACHE_DIR: E2E_TOOL_CACHE_DIR,
    ...extra,
  };
}
