/** Run container as host user on Linux so mounted files are not root-owned. */
export function dockerUserFlag(): string {
  if (process.platform !== 'linux') return '';
  if (typeof process.getuid !== 'function' || typeof process.getgid !== 'function') return '';
  return `-u ${process.getuid()}:${process.getgid()}`;
}
