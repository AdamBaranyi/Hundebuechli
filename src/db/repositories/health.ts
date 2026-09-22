import { and, asc, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';

import { completionOf, type HealthEntryInput, healthEntryInputSchema } from '@/domain/health';
import type { LocalDate } from '@/domain/local-date';

import { attachments, dogs, healthEntries } from '../schema';
import { newId, nowUtc } from '../time';
import type { Db } from '../types';

export type HealthEntry = typeof healthEntries.$inferSelect;

/** Ein offener Termin für «Als Nächstes»: Eintrag mit Fälligkeit, noch nicht erledigt. */
export type OpenDue = HealthEntry & { nextDueDate: LocalDate; dogName: string };

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

function insertEntry(db: Db | Tx, data: ReturnType<typeof healthEntryInputSchema.parse>) {
  const stamp = nowUtc();
  const row: HealthEntry = {
    id: newId(),
    ...data,
    completedByEntryId: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  db.insert(healthEntries).values(row).run();
  return row;
}

/**
 * Legt einen Eintrag an. Gibt es für denselben Hund genau einen offenen
 * Termin derselben Art mit demselben Produkt, gilt er damit als erledigt –
 * sonst stünde die Entwurmung doppelt unter «Als Nächstes». Verschiedene
 * Impfungen mit verschiedenen Produkten bleiben getrennte Termine.
 */
export function createHealthEntry(db: Db, input: HealthEntryInput): HealthEntry {
  const data = healthEntryInputSchema.parse(input);
  return db.transaction((tx) => {
    const created = insertEntry(tx, data);
    if (data.product) {
      const matches = tx
        .select({ id: healthEntries.id })
        .from(healthEntries)
        .where(
          and(
            eq(healthEntries.dogId, data.dogId),
            eq(healthEntries.kind, data.kind),
            sql`lower(${healthEntries.product}) = lower(${data.product})`,
            isNotNull(healthEntries.nextDueDate),
            isNull(healthEntries.completedByEntryId),
            sql`${healthEntries.id} != ${created.id}`,
            sql`${healthEntries.date} <= ${data.date}`,
          ),
        )
        .all();
      const [only] = matches;
      if (only && matches.length === 1) markCompleted(tx, only.id, created.id);
    }
    return created;
  });
}

function markCompleted(db: Db | Tx, id: string, byId: string | null) {
  db.update(healthEntries)
    .set({ completedByEntryId: byId, updatedAt: nowUtc() })
    .where(eq(healthEntries.id, id))
    .run();
}

export function getHealthEntry(db: Db, id: string): HealthEntry | undefined {
  return db.select().from(healthEntries).where(eq(healthEntries.id, id)).get();
}

/** Alle Einträge eines Hundes, der neuste zuerst. */
export function listHealthEntries(db: Db, dogId: string): HealthEntry[] {
  return db
    .select()
    .from(healthEntries)
    .where(eq(healthEntries.dogId, dogId))
    .orderBy(desc(healthEntries.date), desc(healthEntries.createdAt))
    .all();
}

export function updateHealthEntry(db: Db, id: string, input: HealthEntryInput): HealthEntry {
  const data = healthEntryInputSchema.parse(input);
  db.update(healthEntries)
    .set({ ...data, updatedAt: nowUtc() })
    .where(eq(healthEntries.id, id))
    .run();
  const entry = getHealthEntry(db, id);
  if (!entry) throw new Error('Eintrag nicht gefunden');
  return entry;
}

/** Löscht den Eintrag samt Bildern; zurück kommen die Pfade der Dateien. */
export function deleteHealthEntry(db: Db, id: string): { attachmentPaths: string[] } {
  return db.transaction((tx) => {
    const attachmentPaths = tx
      .select({ path: attachments.path })
      .from(attachments)
      .where(eq(attachments.healthEntryId, id))
      .all()
      .map((row) => row.path);
    tx.delete(healthEntries).where(eq(healthEntries.id, id)).run();
    return { attachmentPaths };
  });
}

/** Offene Termine aller Hunde, die nicht archiviert sind, der früheste zuerst. */
export function listOpenDue(db: Db): OpenDue[] {
  const rows = db
    .select({ entry: healthEntries, dogName: dogs.name })
    .from(healthEntries)
    .innerJoin(dogs, eq(dogs.id, healthEntries.dogId))
    .where(
      and(
        isNotNull(healthEntries.nextDueDate),
        isNull(healthEntries.completedByEntryId),
        isNull(dogs.archivedAt),
      ),
    )
    .orderBy(asc(healthEntries.nextDueDate), asc(dogs.createdAt))
    .all();
  return rows.flatMap(({ entry, dogName }) =>
    entry.nextDueDate ? [{ ...entry, nextDueDate: entry.nextDueDate, dogName }] : [],
  );
}

/**
 * «Erledigt» aus der Übersicht: legt den Folgeeintrag mit heutigem Datum an
 * und verweist vom offenen Termin darauf.
 */
export function completeHealthEntry(db: Db, id: string, today: LocalDate): HealthEntry {
  return db.transaction((tx) => {
    const open = tx.select().from(healthEntries).where(eq(healthEntries.id, id)).get();
    if (!open?.nextDueDate || open.completedByEntryId) {
      throw new Error('Kein offener Termin');
    }
    const followUp = insertEntry(tx, healthEntryInputSchema.parse(completionOf(open, today)));
    markCompleted(tx, open.id, followUp.id);
    return followUp;
  });
}

/**
 * Nimmt ein «Erledigt» zurück: Der Folgeeintrag verschwindet, der Termin ist
 * wieder offen. Nur solange am Folgeeintrag nichts hängt.
 */
export function undoCompletion(db: Db, id: string): void {
  db.transaction((tx) => {
    const original = tx.select().from(healthEntries).where(eq(healthEntries.id, id)).get();
    const followUpId = original?.completedByEntryId;
    if (!followUpId) throw new Error('Nicht erledigt');
    const followUp = tx.select().from(healthEntries).where(eq(healthEntries.id, followUpId)).get();
    const hasImages = tx
      .select({ id: attachments.id })
      .from(attachments)
      .where(eq(attachments.healthEntryId, followUpId))
      .get();
    if (!followUp || followUp.completedByEntryId || hasImages) {
      throw new Error('Der Folgeeintrag wurde schon weiterverwendet');
    }
    tx.delete(healthEntries).where(eq(healthEntries.id, followUpId)).run();
    markCompleted(tx, id, null);
  });
}

/** Zuletzt verwendete Produkte eines Hundes für eine Art, für die Vorschläge im Formular. */
export function recentProducts(
  db: Db,
  dogId: string,
  kind: HealthEntry['kind'],
  limit = 3,
): string[] {
  const rows = db
    .select({ product: healthEntries.product })
    .from(healthEntries)
    .where(
      and(
        eq(healthEntries.dogId, dogId),
        eq(healthEntries.kind, kind),
        isNotNull(healthEntries.product),
      ),
    )
    .orderBy(desc(healthEntries.date), desc(healthEntries.createdAt))
    .all();
  const unique = [...new Set(rows.map((row) => row.product).filter((p): p is string => !!p))];
  return unique.slice(0, limit);
}
