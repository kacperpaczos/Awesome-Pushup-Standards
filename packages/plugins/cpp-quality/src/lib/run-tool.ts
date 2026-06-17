import {
  DEFAULT_AUDIT_RIGOR,
  toolMissingAudit,
  type AuditRigor,
} from '@awesome-pushup-standards/audit-contract';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type ToolResult =
  | { status: 'ok'; stdout: string; stderr: string }
  | { status: 'skipped'; reason: string }
  | { status: 'error'; stdout?: string; stderr?: string; code?: number };

export async function runTool(command: string, args: string[], cwd?: string): Promise<ToolResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      maxBuffer: 20 * 1024 * 1024,
    });
    return { status: 'ok', stdout, stderr };
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
    if (err.code === 'ENOENT') return { status: 'skipped', reason: `${command} not found` };
    return {
      status: 'error',
      stdout: err.stdout,
      stderr: err.stderr,
      code: typeof err.code === 'number' ? err.code : 1,
    };
  }
}

export function skippedAudit(slug: string, tool: string, rigor: AuditRigor = DEFAULT_AUDIT_RIGOR) {
  return toolMissingAudit(slug, tool, rigor);
}
