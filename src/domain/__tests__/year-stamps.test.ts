import { yearInStamps } from '../year-stamps';

const TODAY = '2026-09-22';

describe('Das Jahr in Stempeln', () => {
  it('stempelt Monate mit Eintrag und zeigt offene Termine als fällig oder überfällig', () => {
    const [deworming, vaccination] = yearInStamps(
      [
        {
          kind: 'deworming',
          date: '2025-12-03',
          nextDueDate: '2026-03-03',
          completedByEntryId: 'x',
        },
        {
          kind: 'deworming',
          date: '2026-06-25',
          nextDueDate: '2026-09-25',
          completedByEntryId: null,
        },
        {
          kind: 'vaccination',
          date: '2026-04-10',
          nextDueDate: '2026-09-20',
          completedByEntryId: null,
        },
      ],
      ['deworming', 'vaccination'],
      TODAY,
    );
    const marks = (row: typeof deworming) =>
      Object.fromEntries((row?.months ?? []).filter((m) => m.mark).map((m) => [m.month, m.mark]));

    expect(deworming?.months).toHaveLength(12);
    expect(marks(deworming)).toEqual({ '2025-12': 'done', '2026-06': 'done', '2026-09': 'due' });
    expect(marks(vaccination)).toEqual({ '2026-04': 'done', '2026-09': 'overdue' });
  });

  it('lässt einen Stempel vor einem offenen Termin im selben Monat', () => {
    const [row] = yearInStamps(
      [
        { kind: 'deworming', date: '2026-09-02', nextDueDate: null, completedByEntryId: null },
        {
          kind: 'deworming',
          date: '2026-06-01',
          nextDueDate: '2026-09-01',
          completedByEntryId: null,
        },
      ],
      ['deworming'],
      TODAY,
    );
    expect(row?.months.at(-1)).toEqual({ month: '2026-09', mark: 'done' });
  });
});
