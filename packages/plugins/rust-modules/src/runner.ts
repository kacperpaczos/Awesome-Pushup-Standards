import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import {
  DEFAULT_AUDIT_RIGOR,
  toolMissingAudit,
  type AuditRigor,
} from '@awesome-pushup-standards/audit-contract';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type RunnerOptions = { rootDir?: string; rigor?: AuditRigor };

function binary(slug: string, ok: boolean, okLabel: string, failLabel: string): AuditOutput {
  return {
    slug,
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? okLabel : failLabel,
  };
}

function isMissingCargoModules(error: unknown): boolean {
  const err = error as { code?: string; stderr?: Buffer | string; message?: string };
  const detail = `${err.stderr ?? ''}${err.message ?? ''}`;
  return (
    err.code === 'ENOENT' ||
    /no such command.*modules|could not find.*modules|unknown proxy name.*modules/i.test(detail)
  );
}

function isMissingCargoDeny(error: unknown): boolean {
  const err = error as { code?: string; stderr?: Buffer | string; message?: string };
  const detail = `${err.stderr ?? ''}${err.message ?? ''}`;
  return (
    err.code === 'ENOENT' ||
    /no such subcommand.*deny|could not find.*deny|unknown proxy name.*deny/i.test(detail)
  );
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';
  const rigor = options.rigor ?? DEFAULT_AUDIT_RIGOR;

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const denyPath = join(root, 'deny.toml');
    const hasDeny = existsSync(denyPath);
    const hasLock = existsSync(join(root, 'Cargo.lock'));

    let bannedOut: AuditOutput;

    if (!hasDeny) {
      bannedOut = binary(
        'banned-dependencies',
        false,
        'cargo-deny configured',
        'missing deny.toml or violations',
      );
    } else if (!hasLock) {
      bannedOut = binary(
        'banned-dependencies',
        false,
        'cargo-deny configured',
        'missing Cargo.lock',
      );
    } else {
      try {
        await execFileAsync('cargo', ['deny', 'check'], { cwd: root });
        bannedOut = binary(
          'banned-dependencies',
          true,
          'cargo-deny configured',
          'cargo-deny violations',
        );
      } catch (error: unknown) {
        if (isMissingCargoDeny(error)) {
          bannedOut = toolMissingAudit('banned-dependencies', 'cargo-deny', rigor);
        } else {
          bannedOut = binary(
            'banned-dependencies',
            false,
            'cargo-deny configured',
            'cargo-deny violations',
          );
        }
      }
    }

    let cyclesOut: AuditOutput;

    if (!existsSync(join(root, 'Cargo.toml'))) {
      cyclesOut = binary(
        'module-cycles',
        false,
        'no cycles detected',
        'cycles detected or cargo-modules missing',
      );
    } else {
      try {
        await execFileAsync('cargo', ['modules', 'dependencies', '--acyclic'], { cwd: root });
        cyclesOut = binary('module-cycles', true, 'no cycles detected', 'cycles detected');
      } catch (error: unknown) {
        const err = error as {
          stderr?: Buffer | string;
          stdout?: Buffer | string;
          message?: string;
        };
        const detail = `${err.stderr ?? ''}${err.stdout ?? ''}${err.message ?? ''}`;
        if (isMissingCargoModules(error)) {
          cyclesOut = toolMissingAudit('module-cycles', 'cargo-modules', rigor);
        } else if (/circular dependency/i.test(detail)) {
          cyclesOut = binary('module-cycles', false, 'no cycles detected', 'cycles detected');
        } else {
          cyclesOut = binary(
            'module-cycles',
            false,
            'no cycles detected',
            'cycles detected or cargo-modules missing',
          );
        }
      }
    }

    return [cyclesOut, bannedOut];
  };
}
