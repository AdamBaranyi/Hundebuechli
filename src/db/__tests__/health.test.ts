import { createDog, setDogArchived } from '../repositories/dogs';
import { addAttachment } from '../repositories/attachments';
import {
  completeHealthEntry,
  createHealthEntry,
  deleteHealthEntry,
  getHealthEntry,
  listHealthEntries,
  listOpenDue,
  recentProducts,
  undoCompletion,
  updateHealthEntry,
} from '../repositories/health';
import { createTestDb } from '../testing';
import type { Db } from '../types';

const IMAGE = { path: 'photos/e.jpg', sha256: 'abc', width: 1200, height: 900 };

describe('Repository Gesundheit', () => {
  let db: Db;
  let baeri: string;
  let mila: string;

  beforeEach(async () => {
    db = await createTestDb();
    baeri = createDog(db, { name: 'Bäri' }).id;
    mila = createDog(db, { name: 'Mila' }).id;
  });

  const deworming = (
    dogId: string,
    date: string,
    nextDueDate: string | null,
    product = 'Milbemax',
  ) =>
    createHealthEntry(db, {
      dogId,
      kind: 'deworming',
      date,
      product,
      nextDueDate,
      repeatMonths: 3,
    });

  it('legt Einträge an und listet sie je Hund, den neusten zuerst', () => {
    deworming(baeri, '2026-03-20', '2026-06-20');
    deworming(baeri, '2026-06-22', '2026-09-22');
    deworming(mila, '2026-06-01', '2026-09-01');
    expect(listHealthEntries(db, baeri).map((e) => e.date)).toEqual(['2026-06-22', '2026-03-20']);
  });

  it('erledigt einen offenen Termin mit demselben Produkt von selbst', () => {
    const first = deworming(baeri, '2026-06-22', '2026-09-22');
    const second = deworming(baeri, '2026-09-21', '2026-12-21', 'milbemax');
    expect(getHealthEntry(db, first.id)?.completedByEntryId).toBe(second.id);
    expect(listOpenDue(db).map((e) => e.id)).toEqual([second.id]);
  });

  it('lässt verschiedene Impfungen getrennt offen', () => {
    const rabies = createHealthEntry(db, {
      dogId: baeri,
      kind: 'vaccination',
      date: '2025-11-03',
      product: 'Tollwut',
      nextDueDate: '2026-11-03',
    });
    createHealthEntry(db, {
      dogId: baeri,
      kind: 'vaccination',
      date: '2026-04-10',
      product: 'Staupe, Parvo',
      nextDueDate: '2027-04-10',
    });
    expect(getHealthEntry(db, rabies.id)?.completedByEntryId).toBeNull();
    expect(listOpenDue(db)).toHaveLength(2);
  });

  it('zeigt offene Termine aller Hunde, den frühesten zuerst, ohne archivierte Hunde', () => {
    deworming(baeri, '2026-06-25', '2026-09-25');
    deworming(mila, '2026-06-20', '2026-09-20');
    expect(listOpenDue(db).map((e) => [e.dogName, e.nextDueDate])).toEqual([
      ['Mila', '2026-09-20'],
      ['Bäri', '2026-09-25'],
    ]);
    setDogArchived(db, mila, true);
    expect(listOpenDue(db).map((e) => e.dogName)).toEqual(['Bäri']);
  });

  it('«Erledigt» legt den Folgeeintrag an und schliesst den Termin', () => {
    const open = deworming(baeri, '2026-06-25', '2026-09-25');
    const followUp = completeHealthEntry(db, open.id, '2026-09-24');
    expect(followUp).toMatchObject({
      date: '2026-09-24',
      product: 'Milbemax',
      repeatMonths: 3,
      nextDueDate: '2026-12-24',
    });
    expect(getHealthEntry(db, open.id)?.completedByEntryId).toBe(followUp.id);
    expect(listOpenDue(db).map((e) => e.id)).toEqual([followUp.id]);
    expect(() => completeHealthEntry(db, open.id, '2026-09-24')).toThrow('Kein offener Termin');
  });

  it('nimmt «Erledigt» zurück, solange am Folgeeintrag nichts hängt', () => {
    const open = deworming(baeri, '2026-06-25', '2026-09-25');
    const followUp = completeHealthEntry(db, open.id, '2026-09-24');
    undoCompletion(db, open.id);
    expect(getHealthEntry(db, followUp.id)).toBeUndefined();
    expect(getHealthEntry(db, open.id)?.completedByEntryId).toBeNull();

    const again = completeHealthEntry(db, open.id, '2026-09-24');
    addAttachment(db, { healthEntryId: again.id }, IMAGE);
    expect(() => undoCompletion(db, open.id)).toThrow('schon weiterverwendet');
  });

  it('ändert einen Eintrag nur mit gültigen Daten', () => {
    const entry = deworming(baeri, '2026-06-25', '2026-09-25');
    const changed = updateHealthEntry(db, entry.id, {
      dogId: baeri,
      kind: 'deworming',
      date: '2026-06-25',
      product: 'Drontal',
      nextDueDate: '2026-09-25',
    });
    expect(changed.product).toBe('Drontal');
    expect(() =>
      updateHealthEntry(db, entry.id, {
        dogId: baeri,
        kind: 'deworming',
        date: '2026-06-25',
        nextDueDate: '2026-06-01',
      }),
    ).toThrow('due_before_date');
  });

  it('löscht einen Eintrag samt Bildern und gibt einen darauf wartenden Termin frei', () => {
    const open = deworming(baeri, '2026-06-25', '2026-09-25');
    const followUp = completeHealthEntry(db, open.id, '2026-09-24');
    addAttachment(db, { healthEntryId: followUp.id }, IMAGE);
    expect(deleteHealthEntry(db, followUp.id)).toEqual({ attachmentPaths: ['photos/e.jpg'] });
    expect(getHealthEntry(db, open.id)?.completedByEntryId).toBeNull();
  });

  it('schlägt die zuletzt verwendeten Produkte vor, ohne Doppelte', () => {
    deworming(baeri, '2026-01-10', null, 'Drontal');
    deworming(baeri, '2026-03-20', null, 'Milbemax');
    deworming(baeri, '2026-06-22', null, 'Milbemax');
    expect(recentProducts(db, baeri, 'deworming')).toEqual(['Milbemax', 'Drontal']);
    expect(recentProducts(db, mila, 'deworming')).toEqual([]);
  });
});
