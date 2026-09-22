import { daysOverdue, dueBucket, reminderDays } from '../due';

const TODAY = '2026-09-22'; // Dienstag

describe('Fälligkeit', () => {
  it.each([
    ['2026-09-20', 'overdue'],
    ['2026-09-22', 'today'],
    ['2026-09-25', 'thisWeek'],
    ['2026-09-27', 'thisWeek'],
    ['2026-09-28', 'later'],
    ['2027-03-31', 'later'],
  ])('ein Termin am %s steht unter %s', (due, bucket) => {
    expect(dueBucket(due, TODAY)).toBe(bucket);
  });

  it('zählt überfällige Tage', () => {
    expect(daysOverdue('2026-09-20', TODAY)).toBe(2);
    expect(daysOverdue('2026-09-22', TODAY)).toBe(0);
    expect(daysOverdue('2026-09-30', TODAY)).toBe(0);
  });

  it('erinnert am Vorlauftag und am Fälligkeitstag', () => {
    expect(reminderDays('2026-10-02', 7, TODAY)).toEqual(['2026-09-25', '2026-10-02']);
  });

  it('erinnert nicht doppelt und nicht in der Vergangenheit', () => {
    expect(reminderDays('2026-10-02', 0, TODAY)).toEqual(['2026-10-02']);
    expect(reminderDays('2026-09-25', 7, TODAY)).toEqual(['2026-09-25']);
    expect(reminderDays('2026-09-20', 7, TODAY)).toEqual([]);
  });
});
