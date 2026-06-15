import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type RunnerOptions = { rootDir?: string };

function binary(slug: string, ok: boolean, okLabel: string, failLabel: string): AuditOutput {
  return {
    slug,
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? okLabel : failLabel,
  };
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const denyPath = join(root, 'deny.toml');
    const hasDeny = existsSync(denyPath);
    let bannedOk = hasDeny;
    if (hasDeny && existsSync(join(root, 'Cargo.lock'))) {
      try {
        await execFileAsync('cargo', ['deny', 'check'], { cwd: root });
        bannedOk = true;
      } catch (error: unknown) {
        const err = error as { code?: string; stderr?: Buffer | string; message?: string };
        const detail = `${err.stderr ?? ''}${err.message ?? ''}`;
        const cargoMissing = err.code === 'ENOENT';
        const denyMissing =
          /no such subcommand.*deny|could not find.*deny|unknown proxy name.*deny/i.test(detail);
        bannedOk = cargoMissing || denyMissing ? hasDeny : false;
      }
    }

    let cyclesOk = false;
    if (existsSync(join(root, 'Cargo.toml'))) {
      try {
        const { stdout } = await execFileAsync('cargo', ['modules', 'structure', '--json'], {
          cwd: root,
        });
        cyclesOk = !/cycle/i.test(stdout);
      } catch {
        const cargoToml = await readFile(join(root, 'Cargo.toml'), 'utf8').catch(() => '');
        cyclesOk = /cargo-modules|cargo-deny/.test(cargoToml);
      }
    }

    return [
      binary(
        'module-cycles',
        cyclesOk,
        'no cycles detected',
        'cycles detected or cargo-modules missing',
      ),
      binary(
        'banned-dependencies',
        bannedOk,
        'cargo-deny configured',
        'missing deny.toml or violations',
      ),
    ];
  };
}
