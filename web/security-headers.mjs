/**
 * Sicherheits-Header und Content Security Policy der Web-Vorschau. Eine
 * Quelle für beides: den Export (scripts/web-harden.mjs schreibt die CSP als
 * <meta> ins HTML und alle Header in dist/.htaccess) und den Prüfserver der
 * Playwright-Tests (scripts/serve-web.mjs).
 *
 * Die Vorschau lädt nichts von Dritten. Skripte nur vom eigenen Ursprung, nie
 * 'unsafe-inline'. 'wasm-unsafe-eval' braucht sql.js, um SQLite als
 * WebAssembly zu übersetzen; es erlaubt kein eval für JavaScript.
 */

/** @param {{ scriptHashes?: string[] }} [inline] */
export function contentSecurityPolicy(inline = {}) {
  const hashes = (list = []) => list.map((hash) => `'sha256-${hash}'`);
  return [
    "default-src 'none'",
    ["script-src 'self' 'wasm-unsafe-eval'", ...hashes(inline.scriptHashes)].join(' '),
    // react-native-web schreibt Stile zur Laufzeit in <style>-Elemente; deren
    // Inhalt ändert sich mit jedem Bildschirm und lässt sich nicht vorab
    // hashen. Darum 'unsafe-inline' für Stil-Elemente (begründet in
    // docs/SECURITY.md), aber keine Stil-Attribute aus eingeschleustem HTML.
    // style-src bleibt als Rückfall für Browser ohne -elem und -attr.
    "style-src 'self' 'unsafe-inline'",
    "style-src-elem 'self' 'unsafe-inline'",
    "style-src-attr 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; ');
}

/**
 * Header für den Server. frame-ancestors wirkt nur als Header, nicht im
 * <meta>. Kein upgrade-insecure-requests: Safari schreibt damit auch
 * http://localhost um, und die Tests laden dann nichts mehr.
 *
 * @param {string} csp
 * @returns {Record<string, string>}
 */
export function securityHeaders(csp) {
  return {
    'Content-Security-Policy': `${csp}; frame-ancestors 'none'`,
    'Strict-Transport-Security': 'max-age=31536000',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

/**
 * Hashes der Inline-Skripte eines HTML-Dokuments. Die eigene Vorlage
 * public/index.html hat keine; bringt ein Expo-Update eines mit, wird es per
 * Hash erlaubt statt per 'unsafe-inline'.
 *
 * @param {string} html
 * @param {(content: string) => string} sha256Base64
 */
export function inlineHashes(html, sha256Base64) {
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1] ?? '')
    .filter((body) => body.trim().length > 0);
  return { scriptHashes: scripts.map(sha256Base64) };
}
