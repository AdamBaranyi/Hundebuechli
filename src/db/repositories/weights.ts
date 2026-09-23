import { and, asc, desc, eq } from 'drizzle-orm';

import { type WeightInput, weightInputSchema } from '@/domain/weight';

import { weights } from '../schema';
import { newId, nowUtc } from '../time';
import type { Db } from '../types';

export type Weight = typeof weights.$inferSelect;

/**
 * Ein Gewicht je Hund und Tag: Wer zweimal am selben Tag wiegt, ersetzt den
 * Wert – sonst stünden zwei Punkte übereinander in der Kurve.
 */
export function saveWeight(db: Db, input: WeightInput): Weight {
  const data = weightInputSchema.parse(input);
  const stamp = nowUtc();
  const existing = db
    .select()
    .from(weights)
    .where(and(eq(weights.dogId, data.dogId), eq(weights.date, data.date)))
    .get();
  if (existing) {
    db.update(weights)
      .set({ grams: data.grams, updatedAt: stamp })
      .where(eq(weights.id, existing.id))
      .run();
    return { ...existing, grams: data.grams, updatedAt: stamp };
  }
  const row: Weight = { id: newId(), ...data, createdAt: stamp, updatedAt: stamp };
  db.insert(weights).values(row).run();
  return row;
}

/** Alle Wiegungen eines Hundes, die älteste zuerst – so läuft die Kurve. */
export function listWeights(db: Db, dogId: string): Weight[] {
  return db.select().from(weights).where(eq(weights.dogId, dogId)).orderBy(asc(weights.date)).all();
}

/** Das jüngste Gewicht, etwa fürs Profil. */
export function latestWeight(db: Db, dogId: string): Weight | undefined {
  return db
    .select()
    .from(weights)
    .where(eq(weights.dogId, dogId))
    .orderBy(desc(weights.date))
    .get();
}

export function deleteWeight(db: Db, id: string): void {
  db.delete(weights).where(eq(weights.id, id)).run();
}

/** Für die Tabelle: Wiegungen mit dem Unterschied zur vorherigen Zeile. */
export type WeightRow = Weight & { differenceGrams: number | null };

export function listWeightRows(db: Db, dogId: string): WeightRow[] {
  const rows = listWeights(db, dogId);
  return rows.map((row, index) => {
    const previous = rows[index - 1];
    return { ...row, differenceGrams: previous ? row.grams - previous.grams : null };
  });
}
