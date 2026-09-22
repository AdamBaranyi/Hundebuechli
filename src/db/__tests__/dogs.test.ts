import { sql } from 'drizzle-orm';

import {
  countDogs,
  createDog,
  deleteDog,
  getDog,
  listDogs,
  setDogArchived,
  updateDog,
} from '../repositories/dogs';
import { createTestDb } from '../testing';
import type { Db } from '../types';

const STAMP = "'2026-09-22T06:00:00.000Z'";

/** Legt zu einem Hund je eine Zeile in jeder abhängigen Tabelle an, samt Bildern. */
function fillDependents(db: Db, dogId: string, prefix: string) {
  const rows = [
    `INSERT INTO health_entries (id, dog_id, kind, date, created_at, updated_at) VALUES ('${prefix}-h', '${dogId}', 'deworming', '2026-06-25', ${STAMP}, ${STAMP})`,
    `INSERT INTO medications (id, dog_id, name, dose, times, start_date, created_at, updated_at) VALUES ('${prefix}-m', '${dogId}', 'Apoquel 16 mg', 'halbe Tablette', '[480,1080]', '2026-09-01', ${STAMP}, ${STAMP})`,
    `INSERT INTO dose_log (id, medication_id, scheduled_at, given_at, created_at, updated_at) VALUES ('${prefix}-g', '${prefix}-m', '2026-09-22T08:00', ${STAMP}, ${STAMP}, ${STAMP})`,
    `INSERT INTO weights (id, dog_id, date, grams, created_at, updated_at) VALUES ('${prefix}-w', '${dogId}', '2026-09-18', 13800, ${STAMP}, ${STAMP})`,
    `INSERT INTO diary_entries (id, dog_id, date, minute, category, text, created_at, updated_at) VALUES ('${prefix}-t', '${dogId}', '2026-09-12', 1140, 'appetite', 'Frisst langsam', ${STAMP}, ${STAMP})`,
    `INSERT INTO documents (id, dog_id, category, title, created_at, updated_at) VALUES ('${prefix}-d', '${dogId}', 'pet_passport', 'Heimtierausweis', ${STAMP}, ${STAMP})`,
    `INSERT INTO reminders (id, dog_id, title, first_due_date, repeat, lead_days, created_at, updated_at) VALUES ('${prefix}-r', '${dogId}', 'Hundesteuer', '2027-03-31', 'yearly', 14, ${STAMP}, ${STAMP})`,
  ];
  const images = [
    ['dog_id', dogId, 'profil'],
    ['health_entry_id', `${prefix}-h`, 'eintrag'],
    ['diary_entry_id', `${prefix}-t`, 'tagebuch'],
    ['document_id', `${prefix}-d`, 'dokument'],
  ].map(
    ([column, parent, name]) =>
      `INSERT INTO attachments (id, ${column}, path, sha256, width, height, created_at, updated_at) VALUES ('${prefix}-${name}', '${parent}', 'photos/${prefix}-${name}.jpg', 'abc', 1200, 900, ${STAMP}, ${STAMP})`,
  );
  for (const statement of [...rows, ...images]) db.run(sql.raw(statement));
}

function rowCounts(db: Db) {
  const tables = [
    'health_entries',
    'medications',
    'dose_log',
    'weights',
    'diary_entries',
    'documents',
    'reminders',
    'attachments',
  ];
  return Object.fromEntries(
    tables.map((table) => [
      table,
      db.get<{ n: number }>(sql.raw(`SELECT count(*) AS n FROM ${table}`))?.n,
    ]),
  );
}

describe('Repository Hunde', () => {
  let db: Db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('legt einen Hund an und liest ihn wieder', () => {
    const created = createDog(db, { name: '  Bäri  ', breed: 'Whippet', sex: 'male' });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(getDog(db, created.id)).toEqual(created);
    expect(created).toMatchObject({ name: 'Bäri', breed: 'Whippet', neutered: false });
  });

  it('speichert leere Felder als null und die Chipnummer ohne Leerzeichen', () => {
    const dog = createDog(db, { name: 'Mila', allergies: '   ', chipNumber: '756 0981 2345 6789' });
    expect(dog.allergies).toBeNull();
    expect(dog.chipNumber).toBe('756098123456789');
  });

  it('weist ungültige Eingaben ab, ohne etwas zu speichern', () => {
    expect(() => createDog(db, { name: '   ' })).toThrow('required');
    expect(() => createDog(db, { name: 'Bäri', chipNumber: '12345' })).toThrow('chip_invalid');
    expect(() => createDog(db, { name: 'Bäri', birthDate: '2026-02-29' })).toThrow();
    expect(countDogs(db)).toBe(0);
  });

  it('listet in der Reihenfolge des Anlegens und blendet Archivierte aus', () => {
    jest.useFakeTimers({ now: new Date('2026-09-20T08:00:00Z') });
    const baeri = createDog(db, { name: 'Bäri' });
    jest.setSystemTime(new Date('2026-09-21T08:00:00Z'));
    const mila = createDog(db, { name: 'Mila' });
    jest.useRealTimers();

    expect(listDogs(db).map((d) => d.name)).toEqual(['Bäri', 'Mila']);
    setDogArchived(db, baeri.id, true);
    expect(listDogs(db).map((d) => d.id)).toEqual([mila.id]);
    expect(countDogs(db)).toBe(1);
    expect(countDogs(db, { includeArchived: true })).toBe(2);
    expect(setDogArchived(db, baeri.id, false).archivedAt).toBeNull();
  });

  it('ändert einen Hund und setzt den Änderungszeitpunkt', () => {
    jest.useFakeTimers({ now: new Date('2026-09-20T08:00:00Z') });
    const dog = createDog(db, { name: 'Bäri' });
    jest.setSystemTime(new Date('2026-09-22T09:30:00Z'));
    const changed = updateDog(db, dog.id, { name: 'Bäri', food: '2 × 120 g Trockenfutter' });
    jest.useRealTimers();

    expect(changed.food).toBe('2 × 120 g Trockenfutter');
    expect(changed.createdAt).toBe('2026-09-20T08:00:00.000Z');
    expect(changed.updatedAt).toBe('2026-09-22T09:30:00.000Z');
  });

  it('löscht einen Hund samt allem, was zu ihm gehört, und nennt die Bilder', () => {
    const baeri = createDog(db, { name: 'Bäri' });
    const mila = createDog(db, { name: 'Mila' });
    fillDependents(db, baeri.id, 'b');
    fillDependents(db, mila.id, 'm');

    const { attachmentPaths } = deleteDog(db, baeri.id);

    expect(attachmentPaths).toEqual([
      'photos/b-dokument.jpg',
      'photos/b-eintrag.jpg',
      'photos/b-profil.jpg',
      'photos/b-tagebuch.jpg',
    ]);
    expect(getDog(db, baeri.id)).toBeUndefined();
    // Von Bäri bleibt nichts; Milas Zeilen bleiben unberührt, je eine pro Tabelle.
    expect(rowCounts(db)).toEqual({
      health_entries: 1,
      medications: 1,
      dose_log: 1,
      weights: 1,
      diary_entries: 1,
      documents: 1,
      reminders: 1,
      attachments: 4,
    });
  });
});
