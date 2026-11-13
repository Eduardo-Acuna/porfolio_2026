import path from 'node:path';
import { readFile, realpath, stat } from 'node:fs/promises';

const publicCode = new Set([
  'index.html', '404.html', 'css/style.css', 'css/ux.css',
  'js/script.js', 'js/theme.js', 'js/media.js',
]);
const assetExtensions = new Set(['.png', '.webp', '.jpg', '.jpeg', '.svg', '.ico', '.mp4']);

export function assertPublicPath(file) {
  if (typeof file !== 'string' || file.includes('\\') || file.includes('%') ||
      path.posix.isAbsolute(file) || file.split('/').some(part => !part || part.startsWith('.'))) {
    throw new Error(`Unsafe public path: ${file}`);
  }
  if (!publicCode.has(file) && !(file.startsWith('assets/') && assetExtensions.has(path.posix.extname(file)))) {
    throw new Error(`File type not allowed in production: ${file}`);
  }
}

// High-confidence patterns only; never include the matched value in errors.
export function assertNoSecrets(text, file) {
  const signatures = [
    /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
    /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b/,
    /\bsb_secret_[A-Za-z0-9_-]{20,}\b/,
    /\b(?:postgres(?:ql)?|mysql):\/\/[^\s:'"/]+:[^\s@]+@/i,
  ];
  if (signatures.some(pattern => pattern.test(text))) {
    throw new Error(`Possible secret detected in ${file}; value withheld. Review and rotate it before publishing.`);
  }
  // Supabase legacy service-role JWTs must never reach a browser.
  for (const match of text.matchAll(/\beyJ[A-Za-z0-9_-]+\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
    try {
      const payload = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
      if (payload.role === 'service_role') throw new Error('privileged-token');
    } catch (error) {
      if (error.message === 'privileged-token') throw new Error(`Privileged JWT detected in ${file}; value withheld.`);
    }
  }
}

export async function validatePublicFile(file) {
  assertPublicPath(file);
  const root = await realpath('.');
  const resolved = await realpath(file);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !(await stat(resolved)).isFile()) {
    throw new Error(`Public file resolves outside the project or is not a file: ${file}`);
  }
  if (relative.split(path.sep).join('/') !== file) {
    throw new Error(`Symbolic links are not allowed in public inputs: ${file}`);
  }
  if (/\.(?:html|css|js|svg)$/.test(file)) assertNoSecrets(await readFile(file, 'utf8'), file);
}
