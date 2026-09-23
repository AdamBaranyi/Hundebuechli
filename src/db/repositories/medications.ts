import { and, asc, desc, eq, gte, isNull, lte, or } from 'drizzle-orm';

import type { LocalDate } from '@/domain/local-date';
import { atMinute, type LocalDateTime } from '@/domain/local-time';
import { type MedicationInput, medicationInputSchema } from '@/domain/medication';

import { doseLog, dogs, medications } from '../schema';
import { newId, nowUtc } from '../time';
import type { Db } from '../types';

export type Medication = typeof medications.$inferSelect;
export type Dose = typeof doseLog.$inferSelect;

/** Ein Medikament mit dem Hund dazu – für Plan und Fahrplan. */
export type MedicationWithDog = Medication & { dogName: string };

export function createMedication(db: Db, input: MedicationInput): Medication {
  const data = medicationInputSchema.parse(input);
  const stamp = nowUtc();
  const row: Medication = { id: newId(), ...data, createdAt: stamp, updatedAt: stamp };
  db.insert(medications).values(row).run();
  return row;
}

export function getMedication(db: Db, id: string): Medication | undefined {
  return db.select().from(medications).where(eq(medications.id, id)).get();
}

export function updateMedication(db: Db, id: string, input: MedicationInput): Medication {
  const data = medicationInputSchema.parse(input);
  db.update(medications)
    .set({ ...data, updatedAt: nowUtc() })
    .where(eq(medications.id, id))
    .run();
  const row = getMedication(db, id);
  if (!row) throw new Error('Medikament nicht gefunden');
  return row;
}

export function deleteMedication(db: Db, id: string): void {
  db.delete(medications).where(eq(medications.id, id)).run();
}

/** Die Medikamente eines Hundes: laufende zuerst, dann nach Name. */
export function listMedications(db: Db, dogId: string): Medication[] {
  return db
    .select()
    .from(medications)
    .where(eq(medications.dogId, dogId))
    .orderBy(desc(medications.active), asc(medications.name))
    .all();
}

/** Laufende Medikamente aller Hunde, die nicht archiviert sind. */
export function listRunningMedications(db: Db, date: LocalDate): MedicationWithDog[] {
  return db
    .select({ medication: medications, dogName: dogs.name })
    .from(medications)
    .innerJoin(dogs, eq(dogs.id, medications.dogId))
    .where(
      and(
        eq(medications.active, true),
        isNull(dogs.archivedAt),
        lte(medications.startDate, date),
        or(isNull(medications.endDate), gte(medications.endDate, date)),
      ),
    )
    .orderBy(asc(dogs.createdAt), asc(medications.name))
    .all()
    .map(({ medication, dogName }) => ({ ...medication, dogName }));
}

/**
 * Medikamente, die in einem Zeitraum laufen – so weit, wie der Plan der
 * Benachrichtigungen voraus schaut.
 */
export function listMedicationsBetween(
  db: Db,
  from: LocalDate,
  to: LocalDate,
): MedicationWithDog[] {
  return db
    .select({ medication: medications, dogName: dogs.name })
    .from(medications)
    .innerJoin(dogs, eq(dogs.id, medications.dogId))
    .where(
      and(
        eq(medications.active, true),
        isNull(dogs.archivedAt),
        lte(medications.startDate, to),
        or(isNull(medications.endDate), gte(medications.endDate, from)),
      ),
    )
    .orderBy(asc(dogs.createdAt), asc(medications.name))
    .all()
    .map(({ medication, dogName }) => ({ ...medication, dogName }));
}

/** Die Gaben eines Tages, damit der Fahrplan weiss, was schon gegeben ist. */
export function listDosesOn(db: Db, date: LocalDate): Dose[] {
  return db
    .select()
    .from(doseLog)
    .where(
      and(gte(doseLog.scheduledAt, `${date}T00:00`), lte(doseLog.scheduledAt, `${date}T23:59`)),
    )
    .all();
}

/** Gaben ab einem Zeitpunkt – so viel, wie der Plan voraus schaut. */
export function listDosesFrom(db: Db, from: LocalDateTime): Dose[] {
  return db.select().from(doseLog).where(gte(doseLog.scheduledAt, from)).all();
}

/**
 * «Gegeben»: schreibt die Gabe zum geplanten Zeitpunkt. Zweimal getippt
 * ändert nichts – der eindeutige Schlüssel lässt nur eine Zeile zu, und für
 * die spätere Synchronisation ist genau das die konfliktfreie Form.
 */
export function logDose(
  db: Db,
  medicationId: string,
  scheduledAt: LocalDateTime,
  givenAt: LocalDateTime,
): Dose {
  const existing = db
    .select()
    .from(doseLog)
    .where(and(eq(doseLog.medicationId, medicationId), eq(doseLog.scheduledAt, scheduledAt)))
    .get();
  if (existing) return existing;
  const stamp = nowUtc();
  const row: Dose = {
    id: newId(),
    medicationId,
    scheduledAt,
    givenAt,
    createdAt: stamp,
    updatedAt: stamp,
  };
  db.insert(doseLog).values(row).run();
  return row;
}

/** Nimmt eine Gabe zurück, etwa weil sie versehentlich gestempelt wurde. */
export function undoDose(db: Db, medicationId: string, scheduledAt: LocalDateTime): void {
  db.delete(doseLog)
    .where(and(eq(doseLog.medicationId, medicationId), eq(doseLog.scheduledAt, scheduledAt)))
    .run();
}

/** Der Fahrplan eines Tages: jede Uhrzeit je laufendem Medikament. */
export type DoseSlot = {
  medicationId: string;
  dogName: string;
  name: string;
  dose: string;
  scheduledAt: LocalDateTime;
  minute: number;
  givenAt: LocalDateTime | null;
};

export function listDoseSlots(db: Db, date: LocalDate): DoseSlot[] {
  const given = new Map(
    listDosesOn(db, date).map((dose) => [`${dose.medicationId}:${dose.scheduledAt}`, dose.givenAt]),
  );
  return listRunningMedications(db, date)
    .flatMap((medication) =>
      medication.times.map((minute) => {
        const scheduledAt = atMinute(date, minute);
        return {
          medicationId: medication.id,
          dogName: medication.dogName,
          name: medication.name,
          dose: medication.dose,
          scheduledAt,
          minute,
          givenAt: given.get(`${medication.id}:${scheduledAt}`) ?? null,
        };
      }),
    )
    .sort((a, b) => a.minute - b.minute || a.name.localeCompare(b.name));
}
