import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { type DiaryInput, diaryInputSchema } from '@/domain/diary';
import type { LocalDate } from '@/domain/local-date';

import { attachments, diaryEntries } from '../schema';
import { newId, nowUtc } from '../time';
import type { Db } from '../types';

export type DiaryEntry = typeof diaryEntries.$inferSelect;

export type DiaryPhoto = { id: string; path: string };

/** Ein Tagebucheintrag mit seinen Bildern, so wie ihn die Liste zeigt. */
export type DiaryEntryWithPhotos = DiaryEntry & { photos: DiaryPhoto[] };

export function createDiaryEntry(db: Db, input: DiaryInput): DiaryEntry {
  const data = diaryInputSchema.parse(input);
  const stamp = nowUtc();
  const row: DiaryEntry = { id: newId(), ...data, createdAt: stamp, updatedAt: stamp };
  db.insert(diaryEntries).values(row).run();
  return row;
}

export function getDiaryEntry(db: Db, id: string): DiaryEntry | undefined {
  return db.select().from(diaryEntries).where(eq(diaryEntries.id, id)).get();
}

export function updateDiaryEntry(db: Db, id: string, input: DiaryInput): DiaryEntry {
  const data = diaryInputSchema.parse(input);
  db.update(diaryEntries)
    .set({ ...data, updatedAt: nowUtc() })
    .where(eq(diaryEntries.id, id))
    .run();
  const row = getDiaryEntry(db, id);
  if (!row) throw new Error('Tagebucheintrag nicht gefunden');
  return row;
}

/** Löscht den Eintrag samt Bildern; zurück kommen die Pfade der Dateien. */
export function deleteDiaryEntry(db: Db, id: string): { attachmentPaths: string[] } {
  return db.transaction((tx) => {
    const attachmentPaths = tx
      .select({ path: attachments.path })
      .from(attachments)
      .where(eq(attachments.diaryEntryId, id))
      .all()
      .map((row) => row.path);
    tx.delete(diaryEntries).where(eq(diaryEntries.id, id)).run();
    return { attachmentPaths };
  });
}

/** Die Einträge eines Hundes, der neuste zuerst, mit ihren Bildern. */
export function listDiaryEntries(db: Db, dogId: string): DiaryEntryWithPhotos[] {
  const rows = db
    .select()
    .from(diaryEntries)
    .where(eq(diaryEntries.dogId, dogId))
    .orderBy(desc(diaryEntries.date), desc(diaryEntries.minute), desc(diaryEntries.createdAt))
    .all();
  return rows.map((row) => ({ ...row, photos: photosOf(db, row.id) }));
}

export function photosOf(db: Db, diaryEntryId: string): DiaryPhoto[] {
  return db
    .select({ id: attachments.id, path: attachments.path })
    .from(attachments)
    .where(eq(attachments.diaryEntryId, diaryEntryId))
    .orderBy(asc(attachments.createdAt), asc(sql`rowid`))
    .all();
}

/** Die Einträge eines Tages – fürs Tagebuch-PDF an Tag 4. */
export function listDiaryEntriesOn(db: Db, dogId: string, date: LocalDate): DiaryEntry[] {
  return db
    .select()
    .from(diaryEntries)
    .where(and(eq(diaryEntries.dogId, dogId), eq(diaryEntries.date, date)))
    .orderBy(asc(diaryEntries.minute))
    .all();
}
