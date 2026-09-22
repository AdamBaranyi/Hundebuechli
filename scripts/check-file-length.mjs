#!/usr/bin/env node
/**
 * Projektregel: keine projekteigene Code-Datei über 400 physische Zeilen.
 *
 * Zählweise: physische Zeilen einschliesslich Leerzeilen und Kommentaren.
 * Ein einzelner abschliessender Zeilenumbruch erzeugt keine zusätzliche Zeile.
 *
 * Deckt auch ab, was ESLint nicht sieht: YAML der CI, SQL, CSS, HTML. Findet
 * neue, noch nicht eingecheckte Dateien, weil das Dateisystem durchlaufen wird
 * und nicht der Git-Index.
 *
 * Aufruf: node scripts/check-file-length.mjs [--root <verzeichnis>]
 * Exit-Code 1 bei jeder Überschreitung und bei jeder nicht lesbaren Datei.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MAX_LINES = 400;

/** Verzeichnisse, die nie projekteigenen Code enthalten. */
const SKIPPED_DIRS = new Set([
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'web-build',
  'coverage',
  'test-results',
  'playwright-report',
  'ios',
  'android',
]);

/**
 * Dokumentierte Ausschlüsse: die von drizzle-kit erzeugten Migrationen und
 * reine Daten-Fixtures. Beides ist kein handgeschriebener Code; die Ausnahme
 * erlaubt nicht, eigene Logik dorthin zu verschieben.
 */
const EXCLUDED_PATHS = ['src/db/migrations/'];
const EXCLUDED_SEGMENTS = ['/__fixtures__/'];

const CODE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
  '.sql',
  '.yml',
  '.yaml',
]);

/** @param {string} relPath */
function isExcluded(relPath) {
  const posix = `/${relPath.split(sep).join('/')}`;
  if (EXCLUDED_PATHS.some((prefix) => posix.startsWith(`/${prefix}`))) return true;
  return EXCLUDED_SEGMENTS.some((segment) => posix.includes(segment));
}

/** @param {string} name */
function isCodeFile(name) {
  const dot = name.lastIndexOf('.');
  return dot > 0 && CODE_EXTENSIONS.has(name.slice(dot));
}

/**
 * Zählt physische Zeilen. Genau ein abschliessender Zeilenumbruch wird nicht
 * als weitere Zeile gewertet, jeder weitere schon.
 *
 * @param {string} content
 * @returns {number}
 */
export function countLines(content) {
  if (content === '') return 0;
  const parts = content.split('\n');
  if (parts[parts.length - 1] === '') parts.pop();
  return parts.length;
}

/**
 * @param {string} root
 * @param {string} dir
 * @param {string[]} out
 */
function walk(root, dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) walk(root, absolute, out);
      continue;
    }
    if (!entry.isFile() || !isCodeFile(entry.name)) continue;
    if (!isExcluded(relative(root, absolute))) out.push(absolute);
  }
}

/**
 * @param {string} root
 * @returns {{ files: number, violations: { path: string, lines: number }[], unreadable: string[] }}
 */
export function checkTree(root) {
  /** @type {string[]} */
  const files = [];
  walk(root, root, files);
  const violations = [];
  const unreadable = [];
  for (const absolute of files.sort()) {
    const relPath = relative(root, absolute).split(sep).join('/');
    try {
      const lines = countLines(readFileSync(absolute, 'utf8'));
      if (lines > MAX_LINES) violations.push({ path: relPath, lines });
    } catch (error) {
      // Nicht lesbare Dateien werden nicht still übersprungen.
      unreadable.push(`${relPath} — ${String(error)}`);
    }
  }
  return { files: files.length, violations, unreadable };
}

function main() {
  const flag = process.argv.indexOf('--root');
  const root =
    flag === -1 ? fileURLToPath(new URL('..', import.meta.url)) : resolve(process.argv[flag + 1]);
  const { files, violations, unreadable } = checkTree(root);

  for (const item of unreadable) console.error(`Nicht lesbar: ${item}`);
  if (violations.length > 0) {
    console.error(`Über der Grenze von ${MAX_LINES} Zeilen (${violations.length}):`);
    for (const item of violations) {
      console.error(`  ${item.path}  ${item.lines} Zeilen  (+${item.lines - MAX_LINES})`);
    }
    console.error('Teile diese Dateien fachlich auf.');
  }
  if (violations.length > 0 || unreadable.length > 0) process.exit(1);
  console.log(`check:file-length ok — ${files} Dateien geprüft, Grenze ${MAX_LINES} Zeilen.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
