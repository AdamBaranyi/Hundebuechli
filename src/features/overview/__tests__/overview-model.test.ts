import type { OpenDue } from '@/db/repositories/health';

import { buildOverview } from '../overview-model';

const TODAY = '2026-09-22'; // Dienstag

function due(
  id: string,
  dogName: string,
  nextDueDate: string,
  kind: OpenDue['kind'],
  product: string | null,
): OpenDue {
  return {
    id,
    dogId: dogName === 'Bäri' ? 'b' : 'm',
    dogName,
    kind,
    date: '2026-06-01',
    product,
    note: null,
    nextDueDate,
    repeatMonths: 3,
    completedByEntryId: null,
    createdAt: 'x',
    updatedAt: 'x',
  };
}

const OPEN = [
  due('z', 'Mila', '2026-09-20', 'parasite_protection', 'Bravecto'),
  due('h', 'Bäri', '2026-09-22', 'vet_visit', null),
  due('e', 'Bäri', '2026-09-25', 'deworming', 'Milbemax'),
  due('t', 'Mila', '2026-11-03', 'vaccination', 'Tollwut'),
  due('s', 'Bäri', '2027-03-31', 'vaccination', null),
];

describe('Als Nächstes', () => {
  it('teilt in Überfällig, Heute, Diese Woche und Später', () => {
    const sections = buildOverview(OPEN, TODAY, null);
    expect(sections.map((s) => [s.title, s.rows.map((r) => r.id)])).toEqual([
      ['Überfällig', ['z']],
      ['Heute', ['h']],
      ['Diese Woche', ['e']],
      ['Später', ['t', 's']],
    ]);
  });

  it('schreibt den Zustand als Text, fällig in Karmin', () => {
    const rows = buildOverview(OPEN, TODAY, null).flatMap((s) => s.rows);
    expect(rows.map((r) => [r.title, r.secondary, r.status.text, r.status.due])).toEqual([
      ['Zecken- und Flohschutz', 'Mila, Bravecto', 'Seit 2 Tagen überfällig', true],
      ['Tierarztbesuch', 'Bäri', 'Heute fällig', true],
      ['Entwurmung', 'Bäri, Milbemax', 'Fällig am Freitag, 25.9.', false],
      ['Impfung', 'Mila, Tollwut', 'Fällig am 3. November', false],
      ['Impfung', 'Bäri', 'Fällig am 31. März 2027', false],
    ]);
  });

  it('zeigt mit einem gewählten Hund nur seine Termine und lässt leere Abschnitte weg', () => {
    const sections = buildOverview(OPEN, TODAY, 'm');
    expect(sections.map((s) => s.title)).toEqual(['Überfällig', 'Später']);
  });

  it('sagt «seit gestern» bei einem Tag', () => {
    const [section] = buildOverview(
      [due('x', 'Bäri', '2026-09-21', 'deworming', null)],
      TODAY,
      null,
    );
    expect(section?.rows[0]?.status.text).toBe('Seit gestern überfällig');
  });
});
