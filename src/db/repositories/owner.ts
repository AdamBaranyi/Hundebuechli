import { eq } from 'drizzle-orm';

import { type OwnerInput, ownerInputSchema } from '@/domain/owner';

import { owner } from '../schema';
import { SINGLETON_ID } from '../singleton';
import { nowUtc } from '../time';
import type { Db } from '../types';

export type Owner = typeof owner.$inferSelect;

export function getOwner(db: Db): Owner | null {
  return db.select().from(owner).where(eq(owner.id, SINGLETON_ID)).get() ?? null;
}

export function saveOwner(db: Db, input: OwnerInput): Owner {
  const data = ownerInputSchema.parse(input);
  const stamp = nowUtc();
  db.insert(owner)
    .values({ id: SINGLETON_ID, ...data, createdAt: stamp, updatedAt: stamp })
    .onConflictDoUpdate({ target: owner.id, set: { ...data, updatedAt: stamp } })
    .run();
  const saved = getOwner(db);
  if (!saved) throw new Error('Halterangaben nicht gespeichert');
  return saved;
}

/** Entfernt die Halterangaben ganz; die PDFs zeigen danach keine mehr. */
export function clearOwner(db: Db): void {
  db.delete(owner).where(eq(owner.id, SINGLETON_ID)).run();
}
