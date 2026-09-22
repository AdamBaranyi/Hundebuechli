import type { LocalDate } from './local-date';

/*
 * Rechnen mit lokalen Kalenderdaten («2026-09-22»). Gerechnet wird über UTC
 * ohne Uhrzeit, damit Sommer- und Winterzeit keinen Tag verschieben.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

type Parts = { year: number; month: number; day: number };

function parts(date: LocalDate): Parts {
  const [year, month, day] = date.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Kein lokales Datum: ${date}`);
  }
  return { year, month, day };
}

function fromParts({ year, month, day }: Parts): LocalDate {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toUtcMs(date: LocalDate): number {
  const { year, month, day } = parts(date);
  return Date.UTC(year, month - 1, day);
}

function fromUtcMs(ms: number): LocalDate {
  const moment = new Date(ms);
  return fromParts({
    year: moment.getUTCFullYear(),
    month: moment.getUTCMonth() + 1,
    day: moment.getUTCDate(),
  });
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addDays(date: LocalDate, days: number): LocalDate {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

/**
 * Monate addieren und das Monatsende festhalten: 31. Januar plus ein Monat ist
 * der 28. oder 29. Februar, nicht der 3. März.
 */
export function addMonths(date: LocalDate, months: number): LocalDate {
  const { year, month, day } = parts(date);
  const index = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(index / 12);
  const targetMonth = (index % 12) + 1;
  return fromParts({
    year: targetYear,
    month: targetMonth,
    day: Math.min(day, daysInMonth(targetYear, targetMonth)),
  });
}

/** Tage von `from` bis `to`; positiv, wenn `to` später ist. */
export function daysBetween(from: LocalDate, to: LocalDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

/** Wochentag nach Schweizer Zählung: 0 = Montag bis 6 = Sonntag. */
export function weekdayIndex(date: LocalDate): number {
  return (new Date(toUtcMs(date)).getUTCDay() + 6) % 7;
}

/** Der Sonntag der Woche, zu der `date` gehört. */
export function endOfWeek(date: LocalDate): LocalDate {
  return addDays(date, 6 - weekdayIndex(date));
}

/** «2026-09» – der Monat eines Datums. */
export function monthKey(date: LocalDate): string {
  return date.slice(0, 7);
}

/** Die zwölf Monate bis und mit dem Monat von `date`, der älteste zuerst. */
export function lastTwelveMonths(date: LocalDate): string[] {
  const first = addMonths(`${monthKey(date)}-01`, -11);
  return Array.from({ length: 12 }, (_, i) => monthKey(addMonths(first, i)));
}

/** Für Anzeigen: das Datum als JavaScript-Date um Mittag, ohne Zeitzonenfalle. */
export function toDisplayDate(date: LocalDate): Date {
  const { year, month, day } = parts(date);
  return new Date(year, month - 1, day, 12);
}
