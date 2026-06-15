import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type PackageManager = 'npm' | 'pip' | 'cargo' | 'unknown';

export function detectPackageManager(root: string): PackageManager {
  if (existsSync(join(root, 'package-lock.json')) || existsSync(join(root, 'package.json'))) {
    return 'npm';
  }
  if (existsSync(join(root, 'pyproject.toml')) || existsSync(join(root, 'requirements.txt'))) {
    return 'pip';
  }
  if (existsSync(join(root, 'Cargo.toml'))) {
    return 'cargo';
  }
  return 'unknown';
}

export async function hasGitleaksConfig(root: string): Promise<boolean> {
  if (existsSync(join(root, '.gitleaks.toml'))) return true;
  const workflows = join(root, '.github', 'workflows');
  if (!existsSync(workflows)) return false;
  const { readdir } = await import('node:fs/promises');
  const files = await readdir(workflows);
  for (const file of files) {
    const content = await readFile(join(workflows, file), 'utf8');
    if (/gitleaks|trufflehog/i.test(content)) return true;
  }
  return false;
}

export async function hasSyftInCi(root: string): Promise<boolean> {
  const workflows = join(root, '.github', 'workflows');
  if (!existsSync(workflows)) return false;
  const { readdir } = await import('node:fs/promises');
  const files = await readdir(workflows);
  for (const file of files) {
    const content = await readFile(join(workflows, file), 'utf8');
    if (/syft|sbom/i.test(content)) return true;
  }
  return false;
}

export async function hasSastTooling(root: string): Promise<boolean> {
  const pyproject = join(root, 'pyproject.toml');
  if (existsSync(pyproject)) {
    const content = await readFile(pyproject, 'utf8');
    if (/bandit|\[tool\.ruff\].*select.*S/i.test(content) || /bandit|pip-audit/.test(content)) {
      return true;
    }
  }
  const pkg = join(root, 'package.json');
  if (existsSync(pkg)) {
    const content = await readFile(pkg, 'utf8');
    if (/semgrep|eslint-plugin-security/.test(content)) return true;
  }
  return false;
}
