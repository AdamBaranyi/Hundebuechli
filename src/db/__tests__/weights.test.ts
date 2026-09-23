import { createDog } from '../repositories/dogs';
import {
  deleteWeight,
  latestWeight,
  listWeightRows,
  listWeights,
  saveWeight,
} from '../repositories/weights';
import { createTestDb } from '../testing';
import type { Db } from '../types';

describe('Repository Gewicht', () => {
  let db: Db;
  let dogId: string;

  beforeEach(async () => {
    db = await createTestDb();
    dogId = createDog(db, { name: 'Bäri' }).id;
  });

  it('speichert Wiegungen und gibt sie von alt nach neu zurück', () => {
    saveWeight(db, { dogId, date: '2026-09-22', grams: 13800 });
    saveWeight(db, { dogId, date: '2026-06-20', grams: 13200 });
    expect(listWeights(db, dogId).map((row) => row.date)).toEqual(['2026-06-20', '2026-09-22']);
    expect(latestWeight(db, dogId)?.grams).toBe(13800);
  });

  it('ersetzt den Wert, wenn am selben Tag nochmals gewogen wird', () => {
    saveWeight(db, { dogId, date: '2026-09-22', grams: 13800 });
    const second = saveWeight(db, { dogId, date: '2026-09-22', grams: 13900 });
    expect(listWeights(db, dogId)).toHaveLength(1);
    expect(second.grams).toBe(13900);
  });

  it('rechnet für die Tabelle den Unterschied zur vorherigen Zeile', () => {
    saveWeight(db, { dogId, date: '2026-06-20', grams: 13200 });
    saveWeight(db, { dogId, date: '2026-09-22', grams: 13800 });
    expect(listWeightRows(db, dogId).map((row) => row.differenceGrams)).toEqual([null, 600]);
  });

  it('nimmt kein unmögliches Gewicht an', () => {
    expect(() => saveWeight(db, { dogId, date: '2026-09-22', grams: 0 })).toThrow();
    expect(() => saveWeight(db, { dogId, date: '2026-09-22', grams: 200000 })).toThrow();
  });

  it('löscht eine Wiegung', () => {
    const row = saveWeight(db, { dogId, date: '2026-09-22', grams: 13800 });
    deleteWeight(db, row.id);
    expect(listWeights(db, dogId)).toEqual([]);
  });
});
