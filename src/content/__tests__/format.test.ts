import { formatAge, formatLocal, parseInputDate } from '../format';

describe('Formate nach de-CH', () => {
  it('schreibt Daten wie im Entwurf', () => {
    expect(formatLocal.stamp('2026-09-22')).toBe('22.9.');
    expect(formatLocal.long('2026-09-22')).toBe('22. September 2026');
    expect(formatLocal.dayMonth('2026-11-03')).toBe('3. November');
    expect(formatLocal.weekday('2026-09-22')).toBe('Dienstag, 22. September');
    expect(formatLocal.weekdayShort('2026-09-25')).toBe('Freitag, 25.9.');
    expect(formatLocal.full('2026-12-22')).toBe('Dienstag, 22. Dezember 2026');
    expect(formatLocal.input('2026-09-05')).toBe('05.09.2026');
    expect(formatLocal.monthInitial('2025-10')).toBe('O');
  });

  it('liest Daten aus Eingabefeldern, nur gültige', () => {
    expect(parseInputDate('22.09.2026')).toBe('2026-09-22');
    expect(parseInputDate(' 5.9.2026 ')).toBe('2026-09-05');
    expect(parseInputDate('29.02.2028')).toBe('2028-02-29');
    expect(parseInputDate('29.02.2026')).toBeNull();
    expect(parseInputDate('2026-09-22')).toBeNull();
    expect(parseInputDate('22.09.26')).toBeNull();
    expect(parseInputDate('')).toBeNull();
  });

  it('nennt das Alter in Jahren oder Monaten', () => {
    expect(formatAge({ years: 5, months: 0 })).toBe('5 Jahre');
    expect(formatAge({ years: 1, months: 4 })).toBe('1 Jahr');
    expect(formatAge({ years: 0, months: 8 })).toBe('8 Monate');
    expect(formatAge({ years: 0, months: 1 })).toBe('1 Monat');
  });
});
