import { addAttachment } from '../repositories/attachments';
import {
  createDocument,
  deleteDocument,
  listDocuments,
  updateDocument,
} from '../repositories/documents';
import { createDog, deleteDog } from '../repositories/dogs';
import { createTestDb } from '../testing';
import type { Db } from '../types';

const image = (name: string) => ({
  path: `photos/${name}.jpg`,
  sha256: name,
  width: 1200,
  height: 1700,
});

describe('Repository Dokumente', () => {
  let db: Db;
  let dogId: string;

  beforeEach(async () => {
    db = await createTestDb();
    dogId = createDog(db, { name: 'Bäri' }).id;
  });

  it('ordnet nach Art und darin das jüngste zuerst, mit Seiten', () => {
    const policy = createDocument(db, {
      dogId,
      category: 'insurance',
      title: 'Police 2025',
      date: '2025-01-01',
    });
    createDocument(db, { dogId, category: 'insurance', title: 'Police 2026', date: '2026-01-01' });
    createDocument(db, { dogId, category: 'amicus', title: 'Registrierung' });
    addAttachment(db, { documentId: policy.id }, image('seite-1'));
    addAttachment(db, { documentId: policy.id }, image('seite-2'));

    const list = listDocuments(db, dogId);
    expect(list.map((doc) => doc.title)).toEqual(['Registrierung', 'Police 2026', 'Police 2025']);
    expect(list.at(-1)?.pages.map((page) => page.path)).toEqual([
      'photos/seite-1.jpg',
      'photos/seite-2.jpg',
    ]);
  });

  it('ändert ein Dokument und nimmt kein leeres Titelfeld an', () => {
    const doc = createDocument(db, { dogId, category: 'other', title: 'Alt' });
    expect(
      updateDocument(db, doc.id, { dogId, category: 'invoice', title: 'Rechnung' }).category,
    ).toBe('invoice');
    expect(() => createDocument(db, { dogId, category: 'other', title: '  ' })).toThrow();
  });

  it('löscht Dokument samt Seiten und nennt die Dateien', () => {
    const doc = createDocument(db, { dogId, category: 'pet_passport', title: 'Ausweis' });
    addAttachment(db, { documentId: doc.id }, image('ausweis'));
    expect(deleteDocument(db, doc.id)).toEqual({ attachmentPaths: ['photos/ausweis.jpg'] });
    expect(listDocuments(db, dogId)).toEqual([]);
  });

  it('verschwindet mit dem Hund, und seine Seiten werden als Dateien genannt', () => {
    const doc = createDocument(db, { dogId, category: 'pet_passport', title: 'Ausweis' });
    addAttachment(db, { documentId: doc.id }, image('ausweis'));
    expect(deleteDog(db, dogId).attachmentPaths).toContain('photos/ausweis.jpg');
    expect(listDocuments(db, dogId)).toEqual([]);
  });
});
