#!/usr/bin/env node
/**
 * Liefert den Web-Export (dist/) mit denselben Sicherheits-Headern aus wie
 * der Server: für die Playwright-Tests und zum Ansehen. Unbekannte Pfade ohne
 * Dateiendung bekommen index.html, damit Routen direkt aufrufbar sind.
 *
 * Aufruf: node scripts/serve-web.mjs [port]
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';

import { contentSecurityPolicy, inlineHashes, securityHeaders } from '../web/security-headers.mjs';

const ROOT = join(import.meta.dirname, '..', 'dist');
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8095);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

if (!existsSync(join(ROOT, 'index.html'))) {
  console.error('serve-web: dist/index.html fehlt. Zuerst `bun run export:web`.');
  process.exit(1);
}

const sha256Base64 = (content) => createHash('sha256').update(content, 'utf8').digest('base64');
const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
const headers = securityHeaders(contentSecurityPolicy(inlineHashes(indexHtml, sha256Base64)));

/** @param {string} urlPath */
function resolveFile(urlPath) {
  const path = normalize(decodeURIComponent(urlPath.split('?')[0] ?? '/'));
  const candidate = join(ROOT, path);
  if (!candidate.startsWith(ROOT + sep) && candidate !== ROOT) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return extname(path) === '' ? join(ROOT, 'index.html') : null;
}

createServer((request, response) => {
  const file = resolveFile(request.url ?? '/');
  if (!file) {
    response.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Nicht gefunden');
    return;
  }
  response.writeHead(200, {
    ...headers,
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  response.end(readFileSync(file));
}).listen(PORT, '127.0.0.1', () => {
  console.log(`serve-web: http://127.0.0.1:${PORT}`);
});
