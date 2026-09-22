/**
 * @jest-environment node
 */
const { spawnSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const SCRIPT = join(__dirname, '..', 'check-file-length.mjs');

/** Legt eine Datei mit genau `count` Zeilen an, abgeschlossen mit einem Umbruch. */
function fileWithLines(dir, name, count) {
  const body = Array.from({ length: count }, (_, i) => `const line${i} = ${i};`).join('\n');
  writeFileSync(join(dir, name), `${body}\n`);
}

function run(root) {
  return spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8' });
}

describe('check:file-length', () => {
  let root;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'hundebuechli-laenge-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('lässt 399 und 400 Zeilen durch', () => {
    fileWithLines(root, 'kurz.ts', 399);
    fileWithLines(root, 'grenze.ts', 400);
    const result = run(root);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('2 Dateien geprüft');
  });

  it('scheitert bei 401 Zeilen und nennt Pfad und Zeilenzahl', () => {
    mkdirSync(join(root, 'src'));
    fileWithLines(join(root, 'src'), 'zu-lang.tsx', 401);
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('src/zu-lang.tsx  401 Zeilen  (+1)');
  });

  it('prüft auch Formate, die ESLint nicht sieht', () => {
    mkdirSync(join(root, '.github'));
    fileWithLines(join(root, '.github'), 'ci.yml', 401);
    expect(run(root).status).toBe(1);
  });

  it('nimmt nur die erzeugten Migrationen aus, nicht den Rest von src/db', () => {
    mkdirSync(join(root, 'src', 'db', 'migrations'), { recursive: true });
    fileWithLines(join(root, 'src', 'db', 'migrations'), '0000_start.sql', 900);
    expect(run(root).status).toBe(0);
    fileWithLines(join(root, 'src', 'db'), 'schema.ts', 401);
    expect(run(root).status).toBe(1);
  });

  it('zählt einen einzelnen abschliessenden Umbruch nicht als Zeile', () => {
    writeFileSync(join(root, 'genau.ts'), `${'x\n'.repeat(400)}`);
    expect(run(root).status).toBe(0);
    writeFileSync(join(root, 'genau.ts'), `${'x\n'.repeat(400)}\n`);
    expect(run(root).status).toBe(1);
  });
});
