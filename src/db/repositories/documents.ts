import { asc, desc, eq, sql } from 'drizzle-orm';

import { type DocumentInput, documentInputSchema } from '@/domain/document';

import { attachments, documents } from '../schema';
import { newId, nowUtc } from '../time';
import type { Db } from '../types';

export type DogDocument = typeof documents.$inferSelect;
export type DocumentPage = { id: string; path: string };
export type DogDocumentWithPages = DogDocument & { pages: DocumentPage[] };

export function createDocument(db: Db, input: DocumentInput): DogDocument {
  const data = documentInputSchema.parse(input);
  const stamp = nowUtc();
  const row: DogDocument = { id: newId(), ...data, createdAt: stamp, updatedAt: stamp };
  db.insert(documents).values(row).run();
  return row;
}

export function getDocument(db: Db, id: string): DogDocument | undefined {
  return db.select().from(documents).where(eq(documents.id, id)).get();
}

export function updateDocument(db: Db, id: string, input: DocumentInput): DogDocument {
  const data = documentInputSchema.parse(input);
  db.update(documents)
    .set({ ...data, updatedAt: nowUtc() })
    .where(eq(documents.id, id))
    .run();
  const row = getDocument(db, id);
  if (!row) throw new Error('Dokument nicht gefunden');
  return row;
}

/** Löscht das Dokument samt Seiten; zurück kommen die Pfade der Dateien. */
export function deleteDocument(db: Db, id: string): { attachmentPaths: string[] } {
  return db.transaction((tx) => {
    const attachmentPaths = tx
      .select({ path: attachments.path })
      .from(attachments)
      .where(eq(attachments.documentId, id))
      .all()
      .map((row) => row.path);
    tx.delete(documents).where(eq(documents.id, id)).run();
    return { attachmentPaths };
  });
}

/** Die Seiten eines Dokuments in der Reihenfolge, in der sie dazukamen. */
export function pagesOf(db: Db, documentId: string): DocumentPage[] {
  return db
    .select({ id: attachments.id, path: attachments.path })
    .from(attachments)
    .where(eq(attachments.documentId, documentId))
    .orderBy(asc(attachments.createdAt), asc(sql`rowid`))
    .all();
}

/** Die Dokumente eines Hundes nach Art, darin das jüngste zuerst. */
export function listDocuments(db: Db, dogId: string): DogDocumentWithPages[] {
  return db
    .select()
    .from(documents)
    .where(eq(documents.dogId, dogId))
    .orderBy(asc(documents.category), desc(documents.date), desc(documents.createdAt))
    .all()
    .map((row) => ({ ...row, pages: pagesOf(db, row.id) }));
}
