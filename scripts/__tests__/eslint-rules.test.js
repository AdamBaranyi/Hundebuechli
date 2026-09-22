/**
 * Prüft, dass die Projektregeln aus eslint.config.js wirklich greifen: kein
 * Netzwerkcode in app/ und src/, höchstens 400 Zeilen, kein any, kein
 * @ts-ignore. Ohne diesen Test könnte eine Regel still verschwinden, und die
 * grüne CI bewiese nichts mehr.
 *
 * @jest-environment node
 */
const { ESLint } = require('eslint');
const { join } = require('node:path');

const ROOT = join(__dirname, '..', '..');

// Die Konfiguration direkt übergeben: ESLint lädt sie sonst per dynamischem
// import(), und das kann Jest ohne experimentelle Schalter nicht.
const eslint = new ESLint({
  cwd: ROOT,
  overrideConfigFile: true,
  overrideConfig: require('../../eslint.config.js'),
});

async function rulesFor(code, filePath) {
  const [result] = await eslint.lintText(code, { filePath: join(ROOT, filePath) });
  return result.messages.filter((m) => m.severity === 2).map((m) => m.ruleId);
}

function linesOfCode(count) {
  return `${Array.from({ length: count }, (_, i) => `export const v${i} = ${i};`).join('\n')}\n`;
}

describe('ESLint: keine Netzwerkanfragen in der App', () => {
  it.each([
    ['fetch', "fetch('https://example.org');\n", 'no-restricted-globals'],
    ['XMLHttpRequest', 'new XMLHttpRequest();\n', 'no-restricted-globals'],
    ['WebSocket', "new WebSocket('wss://example.org');\n", 'no-restricted-globals'],
    ['window.fetch', "window.fetch('https://example.org');\n", 'no-restricted-properties'],
    ['globalThis.fetch', "globalThis.fetch('/x');\n", 'no-restricted-properties'],
    ['sendBeacon', "navigator.sendBeacon('/x');\n", 'no-restricted-properties'],
    ['axios', "import axios from 'axios';\nexport default axios;\n", 'no-restricted-imports'],
    [
      'expo/fetch',
      "import { fetch } from 'expo/fetch';\nexport { fetch };\n",
      'no-restricted-imports',
    ],
    [
      'Download über expo-file-system',
      "import * as FS from 'expo-file-system';\nFS.downloadAsync('https://x', 'y');\n",
      'no-restricted-syntax',
    ],
  ])('%s in src/ ist ein Fehler', async (_name, code, rule) => {
    expect(await rulesFor(code, 'src/probe.ts')).toContain(rule);
  });

  it('gilt auch für Routen in app/', async () => {
    expect(await rulesFor("fetch('/x');\n", 'app/probe.tsx')).toContain('no-restricted-globals');
  });

  it('gilt nicht für die Playwright-Tests, die den Browser beobachten', async () => {
    expect(await rulesFor("fetch('/x');\n", 'e2e/probe.ts')).not.toContain('no-restricted-globals');
  });
});

describe('ESLint: Projektregeln', () => {
  it('lässt 399 und 400 Zeilen durch und meldet 401', async () => {
    expect(await rulesFor(linesOfCode(399), 'src/probe.ts')).not.toContain('max-lines');
    expect(await rulesFor(linesOfCode(400), 'src/probe.ts')).not.toContain('max-lines');
    expect(await rulesFor(linesOfCode(401), 'src/probe.ts')).toContain('max-lines');
  });

  it('verbietet any und @ts-ignore', async () => {
    const code = 'export const x: any = 1;\n// @ts-ignore\nexport const y = 2;\n';
    const rules = await rulesFor(code, 'src/probe.ts');
    expect(rules).toContain('@typescript-eslint/no-explicit-any');
    expect(rules).toContain('@typescript-eslint/ban-ts-comment');
  });
});
