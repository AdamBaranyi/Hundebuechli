import {
  addAttachment,
  deleteAttachment,
  dogPhoto,
  listAttachments,
  replaceDogPhoto,
} from '../repositories/attachments';
import { createDog } from '../repositories/dogs';
import { createHealthEntry } from '../repositories/health';
import { createTestDb } from '../testing';
import type { Db } from '../types';

const image = (name: string) => ({
  path: `photos/${name}.jpg`,
  sha256: name,
  width: 1200,
  height: 900,
});

describe('Repository Bilder', () => {
  let db: Db;
  let dogId: string;

  beforeEach(async () => {
    db = await createTestDb();
    dogId = createDog(db, { name: 'Bäri' }).id;
  });

  it('hängt Bilder an einen Eintrag und listet sie in ihrer Reihenfolge', () => {
    const entry = createHealthEntry(db, { dogId, kind: 'vet_visit', date: '2026-09-22' });
    // Alle in derselben Millisekunde: Die Reihenfolge darf nicht an der
    // zufälligen ID hängen, sondern an der Reihenfolge des Einfügens.
    const names = ['a', 'b', 'c', 'd', 'e', 'f'];
    for (const name of names) addAttachment(db, { healthEntryId: entry.id }, image(name));
    expect(listAttachments(db, { healthEntryId: entry.id }).map((a) => a.path)).toEqual(
      names.map((name) => `photos/${name}.jpg`),
    );
    expect(listAttachments(db, { dogId })).toEqual([]);
  });

  it('ersetzt das Profilfoto und nennt die alte Datei', () => {
    replaceDogPhoto(db, dogId, image('alt'));
    const { photo, removedPaths } = replaceDogPhoto(db, dogId, image('neu'));
    expect(removedPaths).toEqual(['photos/alt.jpg']);
    expect(dogPhoto(db, dogId)?.id).toBe(photo.id);
    expect(listAttachments(db, { dogId })).toHaveLength(1);
  });

  it('nimmt als Profilfoto das zuletzt eingefügte, auch in derselben Millisekunde', () => {
    addAttachment(db, { dogId }, image('alt'));
    const neu = addAttachment(db, { dogId }, image('neu'));
    expect(dogPhoto(db, dogId)?.id).toBe(neu.id);
  });

  it('löscht ein Bild und gibt seinen Pfad zurück', () => {
    const photo = addAttachment(db, { dogId }, image('x'));
    expect(deleteAttachment(db, photo.id)).toBe('photos/x.jpg');
    expect(deleteAttachment(db, photo.id)).toBeNull();
  });
});
