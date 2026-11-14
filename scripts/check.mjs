import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { assertPublicPath, assertNoSecrets } from './security.mjs';

const html = await readFile('index.html', 'utf8');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.equal(config.outputDirectory, 'dist');
assert(!/<script\b[^>]*>\s*[^<\s]/i.test(html), 'Inline script is forbidden by CSP');
assert(!/\son\w+\s*=/i.test(html), 'Inline event handler is forbidden by CSP');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `Missing anchor: ${match[1]}`);
for (const script of ['js/theme.js', 'js/script.js', 'js/media.js', 'scripts/build.mjs', 'scripts/security.mjs']) execFileSync(process.execPath, ['--check', script]);
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await walk(file); else files.push(file);
  }
}
await walk('dist');
// Windows may hide case-only differences between working files and Git names.
// Git metadata is optional in deployment environments.
let trackedFiles = [];
try {
  trackedFiles = execFileSync('git', ['ls-files', '-z'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).split('\0').filter(Boolean);
} catch { /* Deployment archives may not contain Git metadata. */ }
const trackedByCase = new Map(trackedFiles.map(file => [file.toLowerCase(), file]));
for (const file of files) {
  const publicPath = file.slice('dist/'.length);
  const tracked = trackedByCase.get(publicPath.toLowerCase());
  assert(!tracked || tracked === publicPath, `Filename case differs from Git: ${publicPath}; use ${tracked}`);
}
for (const file of files) {
  assertPublicPath(file.slice('dist/'.length));
  if (/\.(?:html|css|js|svg)$/.test(file)) assertNoSecrets(await readFile(file, 'utf8'), file);
}
assert(files.every(file => !/\.(?:gif|env|py|mjs|md)$/.test(file)), 'Non-public source found in dist');
assert(!files.some(file => file.includes('/.')), 'Hidden files in dist');
for (const match of html.matchAll(/(?:src|href|poster|data-demo-video)="([^"#]+)"/g)) {
  const ref = match[1];
  if (/^(?:https?:|mailto:|tel:)/.test(ref)) continue;
  assert(files.includes(`dist/${ref}`), `Missing public file (case-sensitive): ${ref}`);
}
for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
  for (const item of match[1].split(',')) assert(files.includes(`dist/${item.trim().split(/\s+/)[0]}`), 'Missing picture source');
}
for (const stylesheet of ['css/style.css', 'css/ux.css']) {
  const css = await readFile(`dist/${stylesheet}`, 'utf8');
  for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
    const ref = match[1];
    if (/^(?:https?:|data:)/.test(ref)) continue;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(stylesheet), ref));
    assert(files.includes(`dist/${resolved}`), `Missing CSS asset: ${stylesheet} -> ${ref}`);
  }
}
const videos = files.filter(file => file.endsWith('.mp4'));
assert.equal(videos.length, 5);
for (const video of videos) {
  const data = await readFile(video);
  assert.equal(data.toString('ascii', 4, 8), 'ftyp', `Invalid MP4: ${video}`);
  assert(data.length < 15_000_000, `Demo too large: ${video}`);
}
const headers = config.headers[0].headers;
const csp = headers.find(h => h.key === 'Content-Security-Policy').value;
for (const directive of ["script-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "base-uri 'none'", "form-action 'none'"]) assert(csp.includes(directive));
assert(!/script-src[^;]*unsafe/.test(csp));
assert(csp.includes("connect-src 'none'"));
assert(csp.includes("style-src-elem 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com"));
for (const key of ['Cross-Origin-Resource-Policy', 'Cross-Origin-Opener-Policy']) {
  assert.equal(headers.find(header => header.key === key)?.value, 'same-origin');
}
assert(!headers.some(header => /^access-control-allow-origin$/i.test(header.key)), 'Public CORS access must not be enabled');
for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  assert(/rel="[^"]*\bnoopener\b/.test(match[0]), 'External tab without noopener');
}
const size = (await Promise.all(files.map(async file => (await stat(file)).size))).reduce((a,b) => a+b,0);
console.log(`Checks OK: ${ids.length} unique IDs; all local links and public assets exist; ${videos.length} MP4 demos; JS syntax and security configuration valid. Public size: ${(size / 1e6).toFixed(2)} MB.`);
