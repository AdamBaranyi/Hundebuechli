import type { HealthEntry } from '@/db/repositories/health';

import { emptyHealthForm, healthFormFrom, healthInputFrom } from '../health-form';

const DOG = '5f3c2d8e-4b1a-4c2e-9f7d-1a2b3c4d5e6f';
const TODAY = '2026-09-22';

describe('Formular Eintrag', () => {
  it('rechnet aus der Schnellwahl die nächste Fälligkeit und merkt sich die Wiederholung', () => {
    const result = healthInputFrom(
      { ...emptyHealthForm(DOG, 'deworming'), product: 'Milbemax', dueChoice: '3' },
      TODAY,
    );
    expect(result.input).toMatchObject({
      date: TODAY,
      product: 'Milbemax',
      nextDueDate: '2026-12-22',
      repeatMonths: 3,
    });
  });

  it('nimmt gestern und ein eigenes Datum', () => {
    expect(
      healthInputFrom({ ...emptyHealthForm(DOG, 'vet_visit'), dateChoice: 'yesterday' }, TODAY)
        .input?.date,
    ).toBe('2026-09-21');
    const other = healthInputFrom(
      {
        ...emptyHealthForm(DOG, 'vaccination'),
        dateChoice: 'other',
        dateText: '03.11.2025',
        dueChoice: 'date',
        dueText: '03.11.2026',
      },
      TODAY,
    );
    expect(other.input).toMatchObject({
      date: '2025-11-03',
      nextDueDate: '2026-11-03',
      repeatMonths: null,
    });
  });

  it('sagt, was fehlt oder nicht stimmt', () => {
    const result = healthInputFrom(
      {
        ...emptyHealthForm(null, null),
        dateChoice: 'other',
        dateText: '31.09.2026',
        dueChoice: 'date',
        dueText: 'bald',
      },
      TODAY,
    );
    expect(result.errors).toEqual({
      dogId: 'Wähle, für welchen Hund der Eintrag ist.',
      kind: 'Wähle die Art des Eintrags.',
      date: 'Schreib das Datum so: 22.09.2026.',
      due: 'Schreib das Datum so: 22.09.2026.',
    });
  });

  it('verlangt eine Fälligkeit nach dem Datum des Eintrags', () => {
    const result = healthInputFrom(
      { ...emptyHealthForm(DOG, 'deworming'), dueChoice: 'date', dueText: '01.09.2026' },
      TODAY,
    );
    expect(result.errors).toEqual({
      due: 'Die nächste Fälligkeit liegt nach dem Datum des Eintrags.',
    });
  });

  it('füllt das Formular aus einem gespeicherten Eintrag', () => {
    const entry = {
      id: 'x',
      dogId: DOG,
      kind: 'deworming',
      date: '2026-06-25',
      product: 'Milbemax',
      note: null,
      nextDueDate: '2026-09-25',
      repeatMonths: 3,
      completedByEntryId: null,
      createdAt: 'x',
      updatedAt: 'x',
    } satisfies HealthEntry;
    expect(healthFormFrom(entry, TODAY)).toMatchObject({
      dateChoice: 'other',
      dateText: '25.06.2026',
      dueChoice: '3',
      product: 'Milbemax',
    });
  });
});
