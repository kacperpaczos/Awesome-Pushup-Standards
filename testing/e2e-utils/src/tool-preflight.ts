import { dockerRuntimeEnv, type E2eImage } from './docker.js';
import { runDockerShellCommand } from './docker-run.js';
import { dockerUserFlag } from './docker-user.js';
import { findRepoRoot } from './find-repo-root.js';

export type ToolPreflightSpec = {
  name: string;
  command: string;
  args?: string[];
};

export type ToolPreflightResult = {
  name: string;
  command: string;
  status: 'ok' | 'missing' | 'error';
  path?: string;
  version?: string;
  stderr?: string;
};

function versionArgs(spec: ToolPreflightSpec): string[] {
  return spec.args ?? ['--version'];
}

function buildPreflightShell(specs: ToolPreflightSpec[]): string {
  const lines = specs.map((spec) => {
    const args = versionArgs(spec)
      .map((arg) => JSON.stringify(arg))
      .join(' ');
    const cmd = spec.command;
    const name = spec.name;
    return [
      `echo "@@TOOL_START:${name}:${cmd}@@"`,
      `if command -v ${cmd} >/dev/null 2>&1; then`,
      `  echo "@@TOOL_PATH:${name}:$(command -v ${cmd})@@"`,
      `  ${cmd} ${args} 2>&1 | head -n 1 | awk -v n="${name}" '{print "@@TOOL_VERSION:" n ":" $0 "@@"}'`,
      `  echo "@@TOOL_OK:${name}@@"`,
      `else`,
      `  echo "@@TOOL_MISSING:${name}:${cmd}@@"`,
      `fi`,
    ].join('\n');
  });
  return lines.join('\n');
}

function parsePreflightOutput(output: string, specs: ToolPreflightSpec[]): ToolPreflightResult[] {
  const byName = new Map<string, ToolPreflightResult>();

  for (const spec of specs) {
    byName.set(spec.name, {
      name: spec.name,
      command: spec.command,
      status: 'missing',
    });
  }

  for (const line of output.split('\n')) {
    const start = line.match(/^@@TOOL_START:(?<name>[^:]+):(?<command>.+)@@$/);
    if (start?.groups) continue;

    const pathMatch = line.match(/^@@TOOL_PATH:(?<name>[^:]+):(?<path>.+)@@$/);
    if (pathMatch?.groups) {
      const current = byName.get(pathMatch.groups.name);
      if (current) current.path = pathMatch.groups.path.trim();
      continue;
    }

    const versionMatch = line.match(/^@@TOOL_VERSION:(?<name>[^:]+):(?<version>.+)@@$/);
    if (versionMatch?.groups) {
      const current = byName.get(versionMatch.groups.name);
      if (current) {
        current.version = versionMatch.groups.version.trim();
      }
      continue;
    }

    const okMatch = line.match(/^@@TOOL_OK:(?<name>[^:]+)@@$/);
    if (okMatch?.groups) {
      const current = byName.get(okMatch.groups.name);
      if (current) current.status = 'ok';
      continue;
    }

    const missingMatch = line.match(/^@@TOOL_MISSING:(?<name>[^:]+):(?<command>.+)@@$/);
    if (missingMatch?.groups) {
      const current = byName.get(missingMatch.groups.name);
      if (current) {
        current.status = 'missing';
        current.command = missingMatch.groups.command.trim();
      }
    }
  }

  return specs.map((spec) => byName.get(spec.name)!);
}

export function assertToolPreflightOk(
  results: ToolPreflightResult[],
  context: { fixtureRelPath: string; image: E2eImage },
): void {
  const problems = results.filter((result) => result.status !== 'ok');
  if (problems.length === 0) return;

  const details = problems
    .map((result) => `${result.name} (${result.command}): ${result.status}`)
    .join('; ');
  throw new Error(
    `Required tools unavailable for ${context.fixtureRelPath} (${context.image}): ${details}`,
  );
}

export type RunToolPreflightOptions = {
  fixtureAbs: string;
  image: E2eImage;
  tools: ToolPreflightSpec[];
  repoRoot?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
};

export async function runToolPreflightInContainer(
  options: RunToolPreflightOptions,
): Promise<ToolPreflightResult[]> {
  if (options.tools.length === 0) return [];

  const repoRoot = options.repoRoot ?? findRepoRoot();
  const dockerHome = dockerUserFlag() ? { HOME: '/tmp' } : {};
  const preflightScript = buildPreflightShell(options.tools);
  const shellCmd = [
    `git config --global --add safe.directory ${JSON.stringify(repoRoot)}`,
    preflightScript,
  ].join('\n');

  const result = await runDockerShellCommand({
    image: options.image,
    fixtureAbs: options.fixtureAbs,
    repoRoot,
    env: dockerRuntimeEnv({ ...dockerHome, ...options.env }),
    shellCmd,
    timeoutMs: options.timeoutMs ?? 60_000,
  });

  return parsePreflightOutput(`${result.stdout}\n${result.stderr}`, options.tools);
}
