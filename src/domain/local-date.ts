import { z } from 'zod';

/**
 * Tage sind lokale Kalenderdaten ohne Zeitzone: «2026-09-22». Die Prüfung
 * kennt Monatslängen und Schaltjahre; «2026-02-29» ist kein Datum.
 */
export const localDateSchema = z.iso.date({ error: 'invalid_date' });

export type LocalDate = z.output<typeof localDateSchema>;

/** Das lokale Datum eines Zeitpunkts, in der Zeitzone des Geräts. */
export function toLocalDate(moment: Date): LocalDate {
  const year = String(moment.getFullYear()).padStart(4, '0');
  const month = String(moment.getMonth() + 1).padStart(2, '0');
  const day = String(moment.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Minuten seit Mitternacht, etwa 480 für 08:00. */
export const minuteOfDaySchema = z.number().int().min(0).max(1439);
