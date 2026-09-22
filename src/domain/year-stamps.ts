import { lastTwelveMonths, monthKey } from './calendar';
import type { HealthKind } from './health';
import type { LocalDate } from './local-date';

export type MonthMark = 'done' | 'due' | 'overdue' | null;

type Entry = {
  kind: HealthKind;
  date: LocalDate;
  nextDueDate: LocalDate | null;
  completedByEntryId: string | null;
};

/**
 * «Das Jahr in Stempeln»: je Art zwölf Monate bis heute. Ein Eintrag in einem
 * Monat ist ein Stempel; ein offener Termin in diesem Zeitraum ist fällig
 * oder, wenn er vorbei ist, überfällig. Ein Stempel geht vor.
 */
export function yearInStamps(
  entries: readonly Entry[],
  kinds: readonly HealthKind[],
  today: LocalDate,
): { kind: HealthKind; months: { month: string; mark: MonthMark }[] }[] {
  const months = lastTwelveMonths(today);
  return kinds.map((kind) => {
    const ofKind = entries.filter((entry) => entry.kind === kind);
    const done = new Set(ofKind.map((entry) => monthKey(entry.date)));
    const open = ofKind.filter((entry) => entry.nextDueDate && !entry.completedByEntryId);
    return {
      kind,
      months: months.map((month) => {
        if (done.has(month)) return { month, mark: 'done' as const };
        const due = open.find(
          (entry) => entry.nextDueDate && monthKey(entry.nextDueDate) === month,
        );
        if (!due?.nextDueDate) return { month, mark: null };
        return { month, mark: due.nextDueDate < today ? ('overdue' as const) : ('due' as const) };
      }),
    };
  });
}
