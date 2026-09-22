import { addDays, daysBetween, endOfWeek } from './calendar';
import type { LocalDate } from './local-date';

/**
 * Wo ein fälliger Eintrag in «Als Nächstes» steht. «Diese Woche» heisst bis
 * und mit Sonntag der laufenden Woche; alles danach steht unter «Später».
 */
export type DueBucket = 'overdue' | 'today' | 'thisWeek' | 'later';

export function dueBucket(dueDate: LocalDate, today: LocalDate): DueBucket {
  const days = daysBetween(today, dueDate);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  return dueDate <= endOfWeek(today) ? 'thisWeek' : 'later';
}

/** Wie viele Tage ein Termin überfällig ist; 0, wenn er es nicht ist. */
export function daysOverdue(dueDate: LocalDate, today: LocalDate): number {
  return Math.max(0, daysBetween(dueDate, today));
}

/**
 * Die Tage, an denen erinnert wird: am Vorlauftag und am Fälligkeitstag, nur
 * solche ab heute, ohne doppelte. Überfälliges erinnert nicht täglich.
 */
export function reminderDays(dueDate: LocalDate, leadDays: number, today: LocalDate): LocalDate[] {
  const days = [addDays(dueDate, -leadDays), dueDate].filter((day) => day >= today);
  return [...new Set(days)];
}
