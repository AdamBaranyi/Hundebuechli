/**
 * Hält scripts/audit.sh, die Tabelle der Ausnahmen in docs/SECURITY.md und den
 * Aufruf von bun audit zusammen. Geprüft wird, was das Skript wirklich an bun
 * übergibt (Attrappe im PATH), nicht der Text des Skripts: Eine Ausnahme, die
 * nur im Kommentar steht, fiele sonst nicht auf.
 *
 * @jest-environment node
 */
const { spawnSync } = require('node:child_process');
const {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const ROOT = join(__dirname, '..', '..');
const SCRIPT = join(ROOT, 'scripts', 'audit.sh');
const KENNUNG = /GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/;
const DATUM = /^\d{2}\.\d{2}\.\d{4}$/;

/** bun-Attrappe: schreibt jedes Argument auf eine Zeile und endet mit BUN_EXIT. */
const BUN_ATTRAPPE = `#!/usr/bin/env bash
printf '%s\\n' "$@" > "$ATTRAPPE/argumente"
exit "\${BUN_EXIT:-0}"
`;

/** Führt audit.sh mit der Attrappe aus; liefert Rückgabewert und Argumente an bun. */
function run(args, env = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'hundebuechli-audit-'));
  try {
    writeFileSync(join(dir, 'bun'), BUN_ATTRAPPE);
    chmodSync(join(dir, 'bun'), 0o755);
    const result = spawnSync('bash', [SCRIPT, ...args], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, ATTRAPPE: dir, ...env },
    });
    const file = join(dir, 'argumente');
    const argumente = existsSync(file) ? readFileSync(file, 'utf8').trim().split('\n') : [];
    return { status: result.status, argumente };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Die Kennungen nach jedem --ignore. */
function ignoriert(argumente) {
  return argumente.flatMap((arg, i) => (arg === '--ignore' ? [argumente[i + 1]] : []));
}

/** Zeilen der Tabelle «Ausnahmen im Audit» in docs/SECURITY.md. */
function ausnahmenAusDoku() {
  const text = readFileSync(join(ROOT, 'docs', 'SECURITY.md'), 'utf8');
  return text
    .split('\n')
    .filter((zeile) => /^\| GHSA-/.test(zeile))
    .map((zeile) => {
      const zellen = zeile
        .split('|')
        .slice(1, -1)
        .map((zelle) => zelle.trim());
      const [kennung, paket, stufe, art, grund, geprueft, bis] = zellen;
      return { kennung, paket, stufe, art, grund, geprueft, bis };
    });
}

/** Kennung und Frist aus den --ignore-Zeilen von audit.sh. */
function fristenAusSkript() {
  return readFileSync(SCRIPT, 'utf8')
    .split('\n')
    .filter((zeile) => zeile.trim().startsWith('--ignore'))
    .map((zeile) => [zeile.match(KENNUNG)?.[0], zeile.match(/prüfen bis (\S+)/)?.[1]]);
}

function datum(text) {
  const [tag, monat, jahr] = text.split('.').map(Number);
  return Date.UTC(jahr, monat - 1, tag);
}

function einenMonatSpaeter(zeit) {
  const neu = new Date(zeit);
  neu.setUTCMonth(neu.getUTCMonth() + 1);
  return neu.getTime();
}

const doku = ausnahmenAusDoku();

describe('scripts/audit.sh', () => {
  it('prüft ohne Angabe ab high', () => {
    const { status, argumente } = run([]);
    expect(status).toBe(0);
    expect(argumente.slice(0, 2)).toEqual(['audit', '--audit-level=high']);
  });

  it('prüft auf Wunsch ab moderate', () => {
    expect(run(['moderate']).argumente.slice(0, 2)).toEqual(['audit', '--audit-level=moderate']);
  });

  it('gibt genau die dokumentierten Ausnahmen mit, sonst nichts', () => {
    const { argumente } = run(['high']);
    const mitgegeben = ignoriert(argumente);
    expect(doku.length).toBeGreaterThan(0);
    expect([...mitgegeben].sort()).toEqual(doku.map((zeile) => zeile.kennung).sort());
    expect(argumente).toHaveLength(2 + 2 * mitgegeben.length);
  });

  it('endet rot, wenn bun audit rot endet', () => {
    expect(run(['high'], { BUN_EXIT: '1' }).status).toBe(1);
  });

  it('nennt im Skript dieselbe Frist wie die Tabelle', () => {
    const tabelle = doku.map((zeile) => [zeile.kennung, zeile.bis]);
    expect(fristenAusSkript().sort()).toEqual(tabelle.sort());
  });
});

describe('Ausnahmen in docs/SECURITY.md', () => {
  it.each(doku)('$kennung ist begründet und höchstens einen Monat befristet', (zeile) => {
    expect(zeile.kennung).toMatch(KENNUNG);
    expect(zeile.paket).not.toBe('');
    expect(['kritisch', 'hoch', 'moderat', 'niedrig']).toContain(zeile.stufe);
    expect(zeile.art).toMatch(/^(Laufzeit|Werkzeug)/);
    expect(zeile.grund).not.toBe('');
    expect(zeile.geprueft).toMatch(DATUM);
    expect(zeile.bis).toMatch(DATUM);
    expect(datum(zeile.bis)).toBeGreaterThan(datum(zeile.geprueft));
    expect(datum(zeile.bis)).toBeLessThanOrEqual(einenMonatSpaeter(datum(zeile.geprueft)));
  });
});
