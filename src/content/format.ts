/**
 * Daten und Zahlen nach de-CH: 22.09.2026, 22.9., 13.8 kg, 08:00. Lokale
 * Kalenderdaten werden zum Anzeigen um Mittag ausgewertet, damit keine
 * Zeitzone einen Tag verschiebt.
 */
import { toDisplayDate } from '@/domain/calendar';
import { type LocalDate, localDateSchema } from '@/domain/local-date';

const dayMonth = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'numeric' });
const longDate = new Intl.DateTimeFormat('de-CH', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const dayMonthLong = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long' });
const weekdayDayMonth = new Intl.DateTimeFormat('de-CH', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const weekdayShortDate = new Intl.DateTimeFormat('de-CH', {
  weekday: 'long',
  day: 'numeric',
  month: 'numeric',
});
const fullDate = new Intl.DateTimeFormat('de-CH', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const monthYear = new Intl.DateTimeFormat('de-CH', { month: 'long', year: 'numeric' });
const monthNarrow = new Intl.DateTimeFormat('de-CH', { month: 'narrow' });

/** «22.9.» – so steht das Datum im Stempel. */
export function formatStampDate(moment: Date): string {
  return dayMonth.format(moment);
}

/** «22. September 2026» – für Sätze und VoiceOver. */
export function formatLongDate(moment: Date): string {
  return longDate.format(moment);
}

export const formatLocal = {
  /** «22.9.» */
  stamp: (date: LocalDate) => dayMonth.format(toDisplayDate(date)),
  /** «22. September 2026» */
  long: (date: LocalDate) => longDate.format(toDisplayDate(date)),
  /** «22. September» */
  dayMonth: (date: LocalDate) => dayMonthLong.format(toDisplayDate(date)),
  /** «Dienstag, 22. September» */
  weekday: (date: LocalDate) => weekdayDayMonth.format(toDisplayDate(date)),
  /** «Freitag, 25.9.» */
  weekdayShort: (date: LocalDate) => weekdayShortDate.format(toDisplayDate(date)),
  /** «Dienstag, 22. Dezember 2026» */
  full: (date: LocalDate) => fullDate.format(toDisplayDate(date)),
  /** «Oktober 2025» */
  monthYear: (date: LocalDate) => monthYear.format(toDisplayDate(date)),
  /** «O» für einen Monat, etwa in der Stempelreihe. */
  monthInitial: (month: string) => monthNarrow.format(toDisplayDate(`${month}-01`)),
  /** «22.09.2026» für Eingabefelder. */
  input: (date: LocalDate) => date.split('-').reverse().join('.'),
  /** «08:00» – Minuten seit Mitternacht als Uhrzeit. */
  time: (minute: number) =>
    `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`,
};

/** Liest «22.09.2026» oder «22.9.2026»; gibt das lokale Datum zurück oder null. */
export function parseInputDate(text: string): LocalDate | null {
  const match = /^\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$/.exec(text);
  if (!match) return null;
  const [, day = '', month = '', year = ''] = match;
  const candidate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return localDateSchema.safeParse(candidate).success ? candidate : null;
}

/** «5 Jahre», «1 Jahr», «8 Monate» */
export function formatAge(age: { years: number; months: number | null }): string {
  if (age.years >= 1) return age.years === 1 ? '1 Jahr' : `${age.years} Jahre`;
  const months = age.months ?? 0;
  return months === 1 ? '1 Monat' : `${months} Monate`;
}
