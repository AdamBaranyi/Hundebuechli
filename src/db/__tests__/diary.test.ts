import { addAttachment } from '../repositories/attachments';
import {
  createDiaryEntry,
  deleteDiaryEntry,
  listDiaryEntries,
  listDiaryEntriesOn,
  updateDiaryEntry,
} from '../repositories/diary';
import { createDog } from '../repositories/dogs';
import { createTestDb } from '../testing';
import type { Db } from '../types';

const image = (name: string) => ({
  path: `photos/${name}.jpg`,
  sha256: name,
  width: 1200,
  height: 900,
});

describe('Repository Tagebuch', () => {
  let db: Db;
  let dogId: string;

  beforeEach(async () => {
    db = await createTestDb();
    dogId = createDog(db, { name: 'Bäri' }).id;
  });

  const note = (overrides: Partial<Parameters<typeof createDiaryEntry>[1]> = {}) =>
    createDiaryEntry(db, {
      dogId,
      date: '2026-09-22',
      minute: 480,
      category: 'appetite',
      text: 'Hat nur die Hälfte gefressen.',
      ...overrides,
    });

  it('legt Einträge an und zeigt den neusten zuerst', () => {
    note({ date: '2026-09-20' });
    note({ date: '2026-09-22', minute: 1080, category: 'activity', text: 'Zwei Stunden Wald.' });
    note({ date: '2026-09-22', minute: 480 });
    expect(listDiaryEntries(db, dogId).map((entry) => [entry.date, entry.minute])).toEqual([
      ['2026-09-22', 1080],
      ['2026-09-22', 480],
      ['2026-09-20', 480],
    ]);
  });

  it('hängt Fotos an einen Eintrag und gibt sie in ihrer Reihenfolge zurück', () => {
    const entry = note();
    addAttachment(db, { diaryEntryId: entry.id }, image('a'));
    addAttachment(db, { diaryEntryId: entry.id }, image('b'));
    const [first] = listDiaryEntries(db, dogId);
    expect(first?.photos.map((photo) => photo.path)).toEqual(['photos/a.jpg', 'photos/b.jpg']);
  });

  it('ändert einen Eintrag', () => {
    const entry = note();
    const changed = updateDiaryEntry(db, entry.id, {
      dogId,
      date: '2026-09-23',
      minute: 600,
      category: 'digestion',
      text: 'Wieder normal.',
    });
    expect(changed.category).toBe('digestion');
    expect(changed.date).toBe('2026-09-23');
  });

  it('löscht den Eintrag samt Fotos und nennt die Dateien', () => {
    const entry = note();
    addAttachment(db, { diaryEntryId: entry.id }, image('a'));
    expect(deleteDiaryEntry(db, entry.id)).toEqual({ attachmentPaths: ['photos/a.jpg'] });
    expect(listDiaryEntries(db, dogId)).toEqual([]);
  });

  it('sammelt die Einträge eines Tages der Reihe nach', () => {
    note({ minute: 1080, text: 'Abends' });
    note({ minute: 480, text: 'Morgens' });
    note({ date: '2026-09-21', text: 'Gestern' });
    expect(listDiaryEntriesOn(db, dogId, '2026-09-22').map((entry) => entry.text)).toEqual([
      'Morgens',
      'Abends',
    ]);
  });

  it('nimmt keinen leeren Text an', () => {
    expect(() => note({ text: '   ' })).toThrow();
  });
});
