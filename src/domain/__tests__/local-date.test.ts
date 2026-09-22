import { localDateSchema, toLocalDate } from '../local-date';

describe('Lokales Datum', () => {
  it('kennt Monatslängen und Schaltjahre', () => {
    expect(localDateSchema.safeParse('2028-02-29').success).toBe(true);
    expect(localDateSchema.safeParse('2026-02-29').success).toBe(false);
    expect(localDateSchema.safeParse('2026-04-31').success).toBe(false);
    expect(localDateSchema.safeParse('22.09.2026').success).toBe(false);
  });

  it('nimmt den Kalendertag des Geräts, nicht den in UTC', () => {
    // 23:30 in Zürich ist in UTC schon 21:30 desselben Tages – im Winter 22:30.
    // Kurz nach Mitternacht Ortszeit ist UTC noch beim Vortag.
    const kurzNachMitternacht = new Date(2026, 8, 23, 0, 15);
    expect(toLocalDate(kurzNachMitternacht)).toBe('2026-09-23');
  });
});
