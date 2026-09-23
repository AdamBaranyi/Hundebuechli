import { toLocalDate, type LocalDate } from './local-date';

/*
 * Zeitpunkte in Ortszeit, geschrieben als «2026-09-25T08:00» – ohne Zeitzone
 * und ohne Sekunden. Erst beim Planen wird daraus ein echter Zeitpunkt: So
 * bleibt «08:00» auch nach der Zeitumstellung acht Uhr morgens.
 */

export type LocalDateTime = string & { readonly __localDateTime?: never };

/** «2026-09-25» und 480 ergeben «2026-09-25T08:00». */
export function atMinute(date: LocalDate, minute: number): LocalDateTime {
  const hours = String(Math.floor(minute / 60)).padStart(2, '0');
  const minutes = String(minute % 60).padStart(2, '0');
  return `${date}T${hours}:${minutes}`;
}

/** Der Tag eines Zeitpunkts. */
export function dateOf(moment: LocalDateTime): LocalDate {
  return moment.slice(0, 10);
}

/** Die Minute seit Mitternacht eines Zeitpunkts. */
export function minuteOf(moment: LocalDateTime): number {
  const hours = Number(moment.slice(11, 13));
  const minutes = Number(moment.slice(14, 16));
  return hours * 60 + minutes;
}

/** Jetzt, als Zeitpunkt in Ortszeit. */
export function nowLocal(now: Date): LocalDateTime {
  return atMinute(toLocalDate(now), now.getHours() * 60 + now.getMinutes());
}

/**
 * Der echte Zeitpunkt in der Zeitzone des Geräts. Eine Uhrzeit, die es wegen
 * der Zeitumstellung nicht gibt (in der Nacht der Sprungstunde), rückt dabei
 * nach vorne – so fällt keine Erinnerung aus.
 */
export function toDate(moment: LocalDateTime): Date {
  const [year, month, day] = dateOf(moment).split('-').map(Number);
  const minute = minuteOf(moment);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, Math.floor(minute / 60), minute % 60);
}
