import {
  addDays,
  addMonths,
  daysBetween,
  endOfWeek,
  lastTwelveMonths,
  weekdayIndex,
} from '../calendar';
import { toLocalDate } from '../local-date';

describe('Kalender', () => {
  it('läuft in der Zeitzone Europe/Zurich', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Europe/Zurich');
  });

  it.each([
    ['2026-01-31', 1, '2026-02-28'],
    ['2028-01-31', 1, '2028-02-29'],
    ['2026-03-31', -1, '2026-02-28'],
    ['2026-08-31', 3, '2026-11-30'],
    ['2026-12-15', 1, '2027-01-15'],
    ['2026-09-22', 36, '2029-09-22'],
    ['2028-02-29', 12, '2029-02-28'],
  ])('%s plus %i Monate ist %s (Monatsende festgehalten)', (date, months, expected) => {
    expect(addMonths(date, months)).toBe(expected);
  });

  it('zählt Tage über den Wechsel auf Sommer- und Winterzeit richtig', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(daysBetween('2026-09-25', '2026-09-22')).toBe(-3);
  });

  it('nimmt auch zur Umstellungsstunde den richtigen Kalendertag', () => {
    // 29.03.2026, 02:30 gibt es in Zürich nicht; es bleibt trotzdem der 29.
    expect(toLocalDate(new Date(2026, 2, 29, 2, 30))).toBe('2026-03-29');
    expect(toLocalDate(new Date(2026, 9, 25, 2, 30))).toBe('2026-10-25');
  });

  it('kennt die Schweizer Woche von Montag bis Sonntag', () => {
    expect(weekdayIndex('2026-09-21')).toBe(0);
    expect(weekdayIndex('2026-09-22')).toBe(1);
    expect(weekdayIndex('2026-09-27')).toBe(6);
    expect(endOfWeek('2026-09-22')).toBe('2026-09-27');
    expect(endOfWeek('2026-09-27')).toBe('2026-09-27');
  });

  it('liefert die zwölf Monate bis heute', () => {
    const months = lastTwelveMonths('2026-09-22');
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2025-10');
    expect(months[11]).toBe('2026-09');
  });
});
