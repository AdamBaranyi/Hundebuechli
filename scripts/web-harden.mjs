#!/usr/bin/env node
/**
 * Nach `expo export --platform web`: setzt die Content Security Policy als
 * <meta> direkt nach charset ins HTML und schreibt dist/.htaccess mit allen
 * Sicherheits-Headern für einen Apache-Server. Scheitert, wenn das HTML
 * Ereignis-Handler im Markup enthält oder die Stelle für die CSP fehlt.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { contentSecurityPolicy, inlineHashes, securityHeaders } from '../web/security-headers.mjs';

const DIST = join(import.meta.dirname, '..', 'dist');
const CHARSET = '<meta charset="utf-8" />';

const sha256Base64 = (content) => createHash('sha256').update(content, 'utf8').digest('base64');

function fail(message) {
  console.error(`web-harden: ${message}`);
  process.exit(1);
}

const htmlPath = join(DIST, 'index.html');
const html = readFileSync(htmlPath, 'utf8');

if (html.includes('http-equiv="Content-Security-Policy"')) fail('CSP steht schon im HTML.');
if (!html.includes(CHARSET)) fail(`Stelle für die CSP fehlt: ${CHARSET}`);
if (/\son[a-z]+\s*=/i.test(html)) fail('Ereignis-Handler im Markup gefunden.');

const inline = inlineHashes(html, sha256Base64);
const csp = contentSecurityPolicy(inline);
const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}" />`;
writeFileSync(htmlPath, html.replace(CHARSET, `${CHARSET}\n    ${meta}`));

const headerLines = Object.entries(securityHeaders(csp)).map(
  ([name, value]) => `  Header always set ${name} "${value}"`,
);
const htaccess = [
  '# Hundebüechli, Web-Vorschau. Erzeugt von scripts/web-harden.mjs; Quelle der Werte:',
  '# web/security-headers.mjs. Nicht von Hand ändern.',
  'Options -Indexes',
  'FallbackResource /index.html',
  'AddType application/wasm .wasm',
  '<IfModule mod_headers.c>',
  ...headerLines,
  '</IfModule>',
  '',
].join('\n');
writeFileSync(join(DIST, '.htaccess'), htaccess);

console.log(
  `web-harden: CSP gesetzt (${inline.scriptHashes.length} Inline-Skripte per Hash), ` +
    '.htaccess geschrieben.',
);
