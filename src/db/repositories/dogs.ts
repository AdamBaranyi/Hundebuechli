import { asc, count, eq, inArray, isNull } from 'drizzle-orm';

import { type DogInput, dogInputSchema } from '@/domain/dog';

import { attachments, diaryEntries, documents, dogs, healthEntries } from '../schema';
import { newId, nowUtc } from '../time';
import type { Db } from '../types';

export type Dog = typeof dogs.$inferSelect;

type ListOptions = { includeArchived?: boolean };

export function createDog(db: Db, input: DogInput): Dog {
  const stamp = nowUtc();
  const row: Dog = {
    id: newId(),
    ...dogInputSchema.parse(input),
    archivedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  db.insert(dogs).values(row).run();
  return row;
}

export function getDog(db: Db, id: string): Dog | undefined {
  return db.select().from(dogs).where(eq(dogs.id, id)).get();
}

/** Hunde in der Reihenfolge, in der sie angelegt wurden; archivierte nur auf Wunsch. */
export function listDogs(db: Db, { includeArchived = false }: ListOptions = {}): Dog[] {
  return db
    .select()
    .from(dogs)
    .where(includeArchived ? undefined : isNull(dogs.archivedAt))
    .orderBy(asc(dogs.createdAt), asc(dogs.id))
    .all();
}

export function countDogs(db: Db, { includeArchived = false }: ListOptions = {}): number {
  const row = db
    .select({ value: count() })
    .from(dogs)
    .where(includeArchived ? undefined : isNull(dogs.archivedAt))
    .get();
  return row?.value ?? 0;
}

export function updateDog(db: Db, id: string, input: DogInput): Dog {
  const data = dogInputSchema.parse(input);
  db.update(dogs)
    .set({ ...data, updatedAt: nowUtc() })
    .where(eq(dogs.id, id))
    .run();
  return requireDog(db, id);
}

/** Archivieren statt löschen: Die Einträge bleiben lesbar, Erinnerungen enden. */
export function setDogArchived(db: Db, id: string, archived: boolean): Dog {
  const stamp = nowUtc();
  db.update(dogs)
    .set({ archivedAt: archived ? stamp : null, updatedAt: stamp })
    .where(eq(dogs.id, id))
    .run();
  return requireDog(db, id);
}

/**
 * Löscht den Hund samt allem, was zu ihm gehört; die Datenbank folgt den
 * Fremdschlüsseln. Zurück kommen die Pfade der Bilder, damit der Aufrufer
 * auch die Dateien entfernt – Löschen heisst löschen.
 */
export function deleteDog(db: Db, id: string): { attachmentPaths: string[] } {
  return db.transaction((tx) => {
    const attachmentPaths = attachmentPathsOfDog(tx, id);
    tx.delete(dogs).where(eq(dogs.id, id)).run();
    return { attachmentPaths };
  });
}

function attachmentPathsOfDog(db: Pick<Db, 'select'>, dogId: string): string[] {
  const entryIds = db
    .select({ id: healthEntries.id })
    .from(healthEntries)
    .where(eq(healthEntries.dogId, dogId));
  const diaryIds = db
    .select({ id: diaryEntries.id })
    .from(diaryEntries)
    .where(eq(diaryEntries.dogId, dogId));
  const documentIds = db
    .select({ id: documents.id })
    .from(documents)
    .where(eq(documents.dogId, dogId));

  const rows = db
    .select({ path: attachments.path })
    .from(attachments)
    .where(eq(attachments.dogId, dogId))
    .union(
      db
        .select({ path: attachments.path })
        .from(attachments)
        .where(inArray(attachments.healthEntryId, entryIds)),
    )
    .union(
      db
        .select({ path: attachments.path })
        .from(attachments)
        .where(inArray(attachments.diaryEntryId, diaryIds)),
    )
    .union(
      db
        .select({ path: attachments.path })
        .from(attachments)
        .where(inArray(attachments.documentId, documentIds)),
    )
    .all();
  return rows.map((row) => row.path).sort();
}

function requireDog(db: Db, id: string): Dog {
  const dog = getDog(db, id);
  if (!dog) throw new Error('Hund nicht gefunden');
  return dog;
}
