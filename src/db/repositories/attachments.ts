import { desc, eq } from 'drizzle-orm';

import { attachments } from '../schema';
import { newId, nowUtc } from '../time';
import type { Db } from '../types';

export type Attachment = typeof attachments.$inferSelect;

/** Ein gespeichertes Bild: Pfad relativ zum Dokumentverzeichnis, Prüfsumme, Grösse. */
export type StoredImage = { path: string; sha256: string; width: number; height: number };

export type AttachmentParent =
  { dogId: string } | { healthEntryId: string } | { diaryEntryId: string } | { documentId: string };

function parentColumns(parent: AttachmentParent) {
  return {
    dogId: 'dogId' in parent ? parent.dogId : null,
    healthEntryId: 'healthEntryId' in parent ? parent.healthEntryId : null,
    diaryEntryId: 'diaryEntryId' in parent ? parent.diaryEntryId : null,
    documentId: 'documentId' in parent ? parent.documentId : null,
  };
}

function parentFilter(parent: AttachmentParent) {
  if ('dogId' in parent) return eq(attachments.dogId, parent.dogId);
  if ('healthEntryId' in parent) return eq(attachments.healthEntryId, parent.healthEntryId);
  if ('diaryEntryId' in parent) return eq(attachments.diaryEntryId, parent.diaryEntryId);
  return eq(attachments.documentId, parent.documentId);
}

export function addAttachment(db: Db, parent: AttachmentParent, image: StoredImage): Attachment {
  const stamp = nowUtc();
  const row: Attachment = {
    id: newId(),
    ...parentColumns(parent),
    ...image,
    createdAt: stamp,
    updatedAt: stamp,
  };
  db.insert(attachments).values(row).run();
  return row;
}

/** Bilder eines Besitzers in der Reihenfolge, in der sie dazukamen. */
export function listAttachments(db: Db, parent: AttachmentParent): Attachment[] {
  return db
    .select()
    .from(attachments)
    .where(parentFilter(parent))
    .orderBy(attachments.createdAt, attachments.id)
    .all();
}

/** Das Profilfoto eines Hundes: das jüngste Bild, das direkt am Hund hängt. */
export function dogPhoto(db: Db, dogId: string): Attachment | undefined {
  return db
    .select()
    .from(attachments)
    .where(eq(attachments.dogId, dogId))
    .orderBy(desc(attachments.createdAt), desc(attachments.id))
    .get();
}

/**
 * Ein Hund hat genau ein Profilfoto. Ein neues ersetzt das alte; die Pfade der
 * alten Dateien kommen zurück, damit auch sie gelöscht werden.
 */
export function replaceDogPhoto(
  db: Db,
  dogId: string,
  image: StoredImage,
): { photo: Attachment; removedPaths: string[] } {
  return db.transaction((tx) => {
    const removedPaths = tx
      .select({ path: attachments.path })
      .from(attachments)
      .where(eq(attachments.dogId, dogId))
      .all()
      .map((row) => row.path);
    tx.delete(attachments).where(eq(attachments.dogId, dogId)).run();
    const stamp = nowUtc();
    const photo: Attachment = {
      id: newId(),
      ...parentColumns({ dogId }),
      ...image,
      createdAt: stamp,
      updatedAt: stamp,
    };
    tx.insert(attachments).values(photo).run();
    return { photo, removedPaths };
  });
}

/** Löscht ein Bild; zurück kommt der Pfad der Datei oder null, wenn es keines gab. */
export function deleteAttachment(db: Db, id: string): string | null {
  const row = db.select().from(attachments).where(eq(attachments.id, id)).get();
  if (!row) return null;
  db.delete(attachments).where(eq(attachments.id, id)).run();
  return row.path;
}
