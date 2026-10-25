/**
 * scripts/sicherheits-meldung.sh im Ablauf: gh ist eine Attrappe im PATH, die
 * genau ein Issue in einem Ordner hält und jeden Aufruf mitschreibt. So zeigt
 * der Test, was beim ersten Fund, beim gleichen Bericht, bei neuen Kennungen
 * und ohne Befund wirklich bei GitHub ankäme: eine E-Mail je Änderung, keine
 * je Tag.
 *
 * @jest-environment node
 */
const { spawnSync } = require('node:child_process');
const {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const SCRIPT = join(__dirname, '..', 'sicherheits-meldung.sh');

/** gh-Attrappe: ein einziges Issue (Nummer 7), abgelegt in $ATTRAPPE. */
const GH_ATTRAPPE = `#!/usr/bin/env bash
set -euo pipefail
d="$ATTRAPPE"
wert() {
  local name="$1"
  shift
  while [ $# -gt 0 ]; do
    if [ "$1" = "$name" ]; then printf '%s' "$2"; return; fi
    shift
  done
}
bereich="$1 $2"
shift 2
case "$bereich" in
  "issue list")
    echo "issue list $*" >> "$d/aufrufe"
    if [ -f "$d/offen" ]; then echo 7; fi ;;
  "label create")
    echo "label create $1" >> "$d/aufrufe" ;;
  "issue create")
    echo "issue create titel=$(wert --title "$@") label=$(wert --label "$@") zuweisung=$(wert --assignee "$@")" >> "$d/aufrufe"
    wert --body "$@" > "$d/text"
    touch "$d/offen" ;;
  "issue view")
    echo "issue view $1" >> "$d/aufrufe"
    cat "$d/text" ;;
  "issue edit")
    echo "issue edit $1" >> "$d/aufrufe"
    wert --body "$@" > "$d/text" ;;
  "issue comment")
    echo "issue comment $1" >> "$d/aufrufe"
    wert --body "$@" > "$d/kommentar" ;;
  "issue close")
    echo "issue close $1" >> "$d/aufrufe"
    wert --comment "$@" > "$d/schluss"
    rm -f "$d/offen" ;;
  *)
    echo "unbekannt $bereich $*" >> "$d/aufrufe"
    exit 3 ;;
esac
`;

const KOPF = 'bun audit v1.3.14 (0d9b296a)\n';
/** So endet ein grüner Lauf von scripts/audit.sh. */
const SAUBER = `${KOPF}Keine offenen Befunde ab moderate.\n`;
/** Kein Netz zur Registry: auch keine Kennung, aber nicht sauber. */
const ABGEBROCHEN = `${KOPF}ConnectionRefused: audit request failed\n`;
const BRACES = `braces  <=3.0.3
  jest › @jest/core › micromatch › braces
  high: braces vulnerable to stack-exhaustion - https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
`;
const FORGE = `node-forge  <=1.4.0
  expo › @expo/cli › node-forge
  high: node-forge RSA PKCS#1 v1.5 signature - https://github.com/advisories/GHSA-86w9-cpqp-85rv
`;

describe('scripts/sicherheits-meldung.sh', () => {
  let dir;
  let zustand;
  let bin;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'hundebuechli-meldung-'));
    zustand = join(dir, 'zustand');
    bin = join(dir, 'bin');
    mkdirSync(zustand);
    mkdirSync(bin);
    writeFileSync(join(bin, 'gh'), GH_ATTRAPPE);
    chmodSync(join(bin, 'gh'), 0o755);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  /** Ein Lauf mit diesem Bericht; liefert die Aufrufe an gh nur dieses Laufs. */
  function melden(bericht, { status = 0 } = {}) {
    const vorher = aufrufe().length;
    writeFileSync(join(dir, 'audit.txt'), bericht);
    const result = spawnSync('bash', [SCRIPT, join(dir, 'audit.txt')], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        ATTRAPPE: zustand,
        GH_TOKEN: 'attrappe',
        GH_REPO: 'beispiel/hundebuechli',
        ZUWEISUNG: '',
      },
    });
    expect(result.status).toBe(status);
    if (status === 0) expect(result.stderr).toBe('');
    else expect(result.stderr).toContain('der Audit lief nicht durch');
    return aufrufe().slice(vorher);
  }

  function aufrufe() {
    const file = join(zustand, 'aufrufe');
    return existsSync(file) ? readFileSync(file, 'utf8').trim().split('\n') : [];
  }

  const lesen = (name) => readFileSync(join(zustand, name), 'utf8');

  it('legt beim ersten Fund ein Issue an, mit Label und Zuweisung', () => {
    const lauf = melden(KOPF + BRACES);
    expect(lauf[0]).toContain('issue list --label sicherheit --state open');
    expect(lauf.slice(1)).toEqual([
      'label create sicherheit',
      'issue create titel=Sicherheitsmeldungen label=sicherheit zuweisung=AdamBaranyi',
    ]);
    expect(lesen('text')).toMatch(/^<!-- stand:[0-9a-f]{12} -->\nStand \d{4}-\d{2}-\d{2}, /);
    expect(lesen('text')).toContain('GHSA-vfj7-8cjw-p6xm');
  });

  it('meldet denselben Bericht kein zweites Mal', () => {
    melden(KOPF + BRACES);
    expect(melden(KOPF + BRACES).slice(1)).toEqual(['issue view 7']);
  });

  it('hängt nur an den Kennungen, nicht an Reihenfolge, Wiederholung oder Text', () => {
    melden(KOPF + BRACES + FORGE);
    const anders = `${FORGE}${BRACES.replace('jest › @jest/core', 'metro')}${BRACES}`;
    expect(melden(anders).slice(1)).toEqual(['issue view 7']);
  });

  it('ergänzt Text und Kommentar, wenn eine Kennung dazukommt', () => {
    melden(KOPF + BRACES);
    expect(melden(KOPF + BRACES + FORGE).slice(1)).toEqual([
      'issue view 7',
      'issue edit 7',
      'issue comment 7',
    ]);
    expect(lesen('text')).toContain('GHSA-86w9-cpqp-85rv');
    expect(lesen('kommentar')).toMatch(/^Geänderte Befunde am \d{4}-\d{2}-\d{2}:/);
    expect(lesen('kommentar')).toContain('GHSA-86w9-cpqp-85rv');
  });

  it('lässt das Issue bei sauberem Audit offen und schreibt «keine Befunde» hinein', () => {
    melden(KOPF + BRACES);
    expect(melden(SAUBER).slice(1)).toEqual(['issue view 7', 'issue edit 7']);
    expect(existsSync(join(zustand, 'offen'))).toBe(true);
    expect(lesen('text')).toContain('keine Befunde');
    expect(melden(SAUBER).slice(1)).toEqual(['issue view 7']);
  });

  it('lässt das Issue bei einem abgebrochenen Audit offen und endet rot', () => {
    melden(KOPF + BRACES);
    expect(melden(ABGEBROCHEN, { status: 1 })).toHaveLength(1);
    expect(existsSync(join(zustand, 'offen'))).toBe(true);
    expect(melden(KOPF, { status: 1 })).toHaveLength(1);
  });

  it('tut ohne Fund und ohne offenes Issue nichts', () => {
    const lauf = melden(SAUBER);
    expect(lauf).toHaveLength(1);
    expect(lauf[0]).toMatch(/^issue list /);
  });
});
