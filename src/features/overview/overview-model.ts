import { formatLocal } from '@/content/format';
import { healthKinds } from '@/content/health';
import { overviewText } from '@/content/overview';
import type { OpenDue } from '@/db/repositories/health';
import { daysOverdue, type DueBucket, dueBucket } from '@/domain/due';
import type { LocalDate } from '@/domain/local-date';
import type { IconName } from '@/ui/icon-shapes';

import { kindIcons } from '../health/kind-icons';

export type OverviewRow = {
  id: string;
  dogId: string;
  dogName: string;
  title: string;
  secondary: string;
  status: { text: string; due: boolean };
  icon: IconName;
  bucket: DueBucket;
};

export type OverviewSection = { bucket: DueBucket; title: string; rows: OverviewRow[] };

const ORDER: DueBucket[] = ['overdue', 'today', 'thisWeek', 'later'];

function statusOf(due: LocalDate, bucket: DueBucket, today: LocalDate) {
  switch (bucket) {
    case 'overdue':
      return { text: overviewText.overdue(daysOverdue(due, today)), due: true };
    case 'today':
      return { text: overviewText.dueToday, due: true };
    case 'thisWeek':
      return { text: overviewText.dueOn(formatLocal.weekdayShort(due)), due: false };
    case 'later': {
      const sameYear = due.slice(0, 4) === today.slice(0, 4);
      const date = sameYear ? formatLocal.dayMonth(due) : formatLocal.long(due);
      return { text: overviewText.dueOn(date), due: false };
    }
  }
}

/**
 * Die offenen Termine in Abschnitte geteilt: Überfällig, Heute, Diese Woche,
 * Später. Leere Abschnitte fallen weg; mit einem Hund gewählt nur seine.
 */
export function buildOverview(
  open: readonly OpenDue[],
  today: LocalDate,
  dogId: string | null,
  /** «Heute» steht auch dann, wenn nur Medikamente anstehen. */
  hasDosesToday = false,
): OverviewSection[] {
  const rows = open
    .filter((entry) => dogId === null || entry.dogId === dogId)
    .map((entry): OverviewRow => {
      const bucket = dueBucket(entry.nextDueDate, today);
      return {
        id: entry.id,
        dogId: entry.dogId,
        dogName: entry.dogName,
        title: healthKinds[entry.kind],
        secondary: entry.product ? `${entry.dogName}, ${entry.product}` : entry.dogName,
        status: statusOf(entry.nextDueDate, bucket, today),
        icon: kindIcons[entry.kind],
        bucket,
      };
    });
  return ORDER.map((bucket) => ({
    bucket,
    title: overviewText.sections[bucket],
    rows: rows.filter((row) => row.bucket === bucket),
  })).filter((section) => section.rows.length > 0 || (section.bucket === 'today' && hasDosesToday));
}
