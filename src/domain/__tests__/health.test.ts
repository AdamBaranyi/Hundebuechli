import { completionOf, healthEntryInputSchema, nextDueFrom } from '../health';

const DOG = '5f3c2d8e-4b1a-4c2e-9f7d-1a2b3c4d5e6f';

describe('Gesundheitseintrag', () => {
  it('trimmt Texte und lässt leere Felder weg', () => {
    const entry = healthEntryInputSchema.parse({
      dogId: DOG,
      kind: 'deworming',
      date: '2026-09-22',
      product: '  Milbemax ',
      note: '   ',
    });
    expect(entry).toMatchObject({ product: 'Milbemax', note: null, nextDueDate: null });
  });

  it('verlangt eine nächste Fälligkeit nach dem Datum des Eintrags', () => {
    const result = healthEntryInputSchema.safeParse({
      dogId: DOG,
      kind: 'vaccination',
      date: '2026-09-22',
      nextDueDate: '2026-09-22',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ['nextDueDate'],
      message: 'due_before_date',
    });
  });

  it('weist eine unbekannte Art und einen fremden Hund ab', () => {
    expect(
      healthEntryInputSchema.safeParse({ dogId: 'x', kind: 'deworming', date: '2026-09-22' })
        .success,
    ).toBe(false);
    expect(
      healthEntryInputSchema.safeParse({ dogId: DOG, kind: 'bad', date: '2026-09-22' }).success,
    ).toBe(false);
  });

  it('berechnet die nächste Fälligkeit mit festgehaltenem Monatsende', () => {
    expect(nextDueFrom('2026-01-31', 1)).toBe('2026-02-28');
    expect(nextDueFrom('2026-09-22', 3)).toBe('2026-12-22');
    expect(nextDueFrom('2026-09-22', null)).toBeNull();
  });

  it('«Erledigt» übernimmt Produkt und Wiederholung, Datum ist heute', () => {
    const next = completionOf(
      { dogId: DOG, kind: 'deworming', product: 'Milbemax', repeatMonths: 3 },
      '2026-09-25',
    );
    expect(next).toEqual({
      dogId: DOG,
      kind: 'deworming',
      date: '2026-09-25',
      product: 'Milbemax',
      note: null,
      nextDueDate: '2026-12-25',
      repeatMonths: 3,
    });
  });

  it('«Erledigt» ohne Wiederholung plant keine neue Fälligkeit', () => {
    const next = completionOf(
      { dogId: DOG, kind: 'vet_visit', product: null, repeatMonths: null },
      '2026-09-28',
    );
    expect(next.nextDueDate).toBeNull();
  });
});
