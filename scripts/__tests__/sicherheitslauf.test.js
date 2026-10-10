/**
 * Die Regel vom 10.10.2026 (docs/ENTSCHEIDE.md, E-76) in den Schritten der
 * Workflows, nicht in ihren Kommentaren: Der tägliche Lauf meldet Befunde der
 * Abhängigkeiten nur und wird allein wegen eines Geheimnisses rot; Push und
 * Pull Request blockieren ab high.
 *
 * @jest-environment node
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { parse } = require('yaml');

const ROOT = join(__dirname, '..', '..');
const workflow = (name) => parse(readFileSync(join(ROOT, '.github', 'workflows', name), 'utf8'));
const schritte = (wf) => Object.values(wf.jobs).flatMap((job) => job.steps);
const befehl = (schritt) => schritt.run ?? '';
/** Der Befehl ohne Text in Anführungszeichen, etwa eine Überschrift in echo. */
const ohneText = (schritt) => befehl(schritt).replace(/'[^']*'|"[^"]*"/g, '');

describe('Täglicher Sicherheitslauf', () => {
  const wf = workflow('sicherheit-taeglich.yml');
  const steps = schritte(wf);

  it('liest den Code und schreibt nur Issues', () => {
    expect(wf.permissions).toEqual({ contents: 'read', issues: 'write' });
  });

  it('sammelt Befunde ab moderat, ohne rot zu werden', () => {
    const sammeln = steps.filter((schritt) => befehl(schritt).includes('scripts/audit.sh'));
    expect(sammeln).toHaveLength(1);
    expect(befehl(sammeln[0])).toMatch(
      /^bash scripts\/audit\.sh moderate > audit\.txt 2>&1 \|\| true$/m,
    );
  });

  it('ruft bun audit nirgends am Skript vorbei auf', () => {
    expect(steps.filter((schritt) => /\bbun audit\b/.test(ohneText(schritt)))).toEqual([]);
  });

  it('meldet über das Issue-Skript, mit dem Token des Laufs', () => {
    const melden = steps.filter((schritt) => befehl(schritt).includes('sicherheits-meldung.sh'));
    expect(melden).toHaveLength(1);
    expect(befehl(melden[0]).trim()).toBe('bash scripts/sicherheits-meldung.sh audit.txt');
    expect(melden[0].env.GH_TOKEN).toMatch(/^\$\{\{ github\.token \}\}$/);
    expect(melden[0].env.GH_REPO).toMatch(/^\$\{\{ github\.repository \}\}$/);
  });

  it('bleibt rot, wenn gitleaks ein Geheimnis findet', () => {
    const scan = steps.filter((schritt) => befehl(schritt).includes('gitleaks git'));
    expect(scan).toHaveLength(1);
    expect(befehl(scan[0])).not.toMatch(/\|\||; *true|exit 0/);
    expect(scan[0]['continue-on-error']).toBeUndefined();
  });
});

describe('CI bei Push und Pull Request', () => {
  const steps = schritte(workflow('ci.yml'));

  it('blockiert ab high, mit den Ausnahmen aus scripts/audit.sh', () => {
    const audit = steps.filter((schritt) => /audit/.test(befehl(schritt)));
    expect(audit).toHaveLength(1);
    expect(befehl(audit[0]).trim()).toBe('bash scripts/audit.sh high');
    expect(audit[0]['continue-on-error']).toBeUndefined();
  });
});
