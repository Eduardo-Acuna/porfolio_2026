import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { validatePublicFile } from './security.mjs';

// Explicit allowlist: repository files and original recordings never become public.
const html = await readFile('index.html', 'utf8');
const stylesheets = ['css/style.css', 'css/ux.css'];
const css = (await Promise.all(stylesheets.map(file => readFile(file, 'utf8')))).join('\n');
const refs = new Set(['css/style.css', 'css/ux.css', 'js/script.js', 'js/theme.js', 'js/media.js', '404.html']);
for (const match of html.matchAll(/(?:src|href|poster|data-demo-video)="(assets\/[^"#?]+)"/g)) refs.add(match[1]);
for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
  for (const candidate of match[1].split(',')) {
    const file = candidate.trim().split(/\s+/)[0];
    if (file.startsWith('assets/')) refs.add(file);
  }
}
for (const match of css.matchAll(/url\(['"]?(assets\/[^)'"\s]+|\.\.\/assets\/[^)'"\s]+)['"]?\)/g)) refs.add(match[1].replace(/^\.\.\//, ''));
// Validate all inputs before replacing the previous output.
await Promise.all(['index.html', ...refs].map(validatePublicFile));
// Clear only this project's generated output so removed assets cannot linger.
const output = path.resolve('dist');
if (path.dirname(output) !== process.cwd() || path.basename(output) !== 'dist') throw new Error('Unexpected output directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile('dist/index.html', html);
for (const file of refs) {
  if (path.isAbsolute(file) || file.split('/').includes('..')) throw new Error(`Unsafe public path: ${file}`);
  await mkdir(path.dirname(path.join('dist', file)), { recursive: true });
  await cp(file, path.join('dist', file));
}
console.log(`Build OK: index.html and ${refs.size} public files.`);
