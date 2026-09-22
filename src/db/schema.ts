import { sql } from 'drizzle-orm';
import {
  type AnySQLiteColumn,
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { SINGLETON_ID } from './singleton';

/*
 * Datenmodell nach Auftrag, Abschnitt 7. Regeln, die überall gelten:
 * - IDs sind UUIDs (Grundlage für die spätere Synchronisation).
 * - Tage als lokales Datum «2026-09-22», Uhrzeiten als Minuten seit
 *   Mitternacht, erstellt und geändert als Zeitstempel in UTC.
 * - Keine Fliesskommazahlen: Gewicht in ganzen Gramm, Dosen als Text.
 * - Was zu einem Hund gehört, wird mit ihm gelöscht (ON DELETE CASCADE).
 */

const timestamps = {
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
};

const dogReference = () =>
  text('dog_id')
    .notNull()
    .references(() => dogs.id, { onDelete: 'cascade' });

/** Halterangaben: genau eine Zeile, nur für Hundesitter-Blatt und Vermisst-Plakat. */
export const owner = sqliteTable(
  'owner',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),
    ...timestamps,
  },
  (t) => [check('owner_single_row', sql`${t.id} = ${sql.raw(`'${SINGLETON_ID}'`)}`)],
);

export const dogs = sqliteTable(
  'dogs',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    birthDate: text('birth_date'),
    birthYear: integer('birth_year'),
    breed: text('breed'),
    sex: text('sex', { enum: ['male', 'female'] }),
    neutered: integer('neutered', { mode: 'boolean' }).notNull().default(false),
    colorMarkings: text('color_markings'),
    chipNumber: text('chip_number'),
    amicusRegistered: integer('amicus_registered', { mode: 'boolean' }).notNull().default(false),
    insuranceName: text('insurance_name'),
    insurancePolicy: text('insurance_policy'),
    insurancePhone: text('insurance_phone'),
    vetName: text('vet_name'),
    vetPhone: text('vet_phone'),
    vetAddress: text('vet_address'),
    food: text('food'),
    allergies: text('allergies'),
    careNotes: text('care_notes'),
    archivedAt: text('archived_at'),
    ...timestamps,
  },
  (t) => [
    check('dogs_sex', sql`${t.sex} IS NULL OR ${t.sex} IN ('male', 'female')`),
    check(
      'dogs_chip_number',
      sql`${t.chipNumber} IS NULL OR (length(${t.chipNumber}) = 15 AND ${t.chipNumber} NOT GLOB '*[^0-9]*')`,
    ),
  ],
);

export const healthEntries = sqliteTable(
  'health_entries',
  {
    id: text('id').primaryKey(),
    dogId: dogReference(),
    kind: text('kind', {
      enum: ['vaccination', 'deworming', 'parasite_protection', 'vet_visit'],
    }).notNull(),
    date: text('date').notNull(),
    product: text('product'),
    note: text('note'),
    nextDueDate: text('next_due_date'),
    repeatMonths: integer('repeat_months'),
    completedByEntryId: text('completed_by_entry_id').references(
      (): AnySQLiteColumn => healthEntries.id,
      { onDelete: 'set null' },
    ),
    ...timestamps,
  },
  (t) => [
    index('health_entries_dog').on(t.dogId),
    check(
      'health_entries_kind',
      sql`${t.kind} IN ('vaccination', 'deworming', 'parasite_protection', 'vet_visit')`,
    ),
    check('health_entries_repeat', sql`${t.repeatMonths} IS NULL OR ${t.repeatMonths} > 0`),
  ],
);

export const medications = sqliteTable(
  'medications',
  {
    id: text('id').primaryKey(),
    dogId: dogReference(),
    name: text('name').notNull(),
    dose: text('dose').notNull(),
    /** Uhrzeiten als Minuten seit Mitternacht, etwa [480, 1080] für 08:00 und 18:00. */
    times: text('times', { mode: 'json' }).$type<number[]>().notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (t) => [index('medications_dog').on(t.dogId)],
);

export const doseLog = sqliteTable(
  'dose_log',
  {
    id: text('id').primaryKey(),
    medicationId: text('medication_id')
      .notNull()
      .references(() => medications.id, { onDelete: 'cascade' }),
    /** Geplanter Zeitpunkt in Ortszeit, etwa «2026-09-22T08:00». */
    scheduledAt: text('scheduled_at').notNull(),
    givenAt: text('given_at').notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex('dose_log_once').on(t.medicationId, t.scheduledAt)],
);

export const weights = sqliteTable(
  'weights',
  {
    id: text('id').primaryKey(),
    dogId: dogReference(),
    date: text('date').notNull(),
    grams: integer('grams').notNull(),
    ...timestamps,
  },
  (t) => [
    index('weights_dog').on(t.dogId),
    check('weights_grams', sql`${t.grams} > 0 AND ${t.grams} < 200000`),
  ],
);

export const diaryEntries = sqliteTable(
  'diary_entries',
  {
    id: text('id').primaryKey(),
    dogId: dogReference(),
    date: text('date').notNull(),
    /** Minuten seit Mitternacht, Ortszeit. */
    minute: integer('minute').notNull(),
    category: text('category', {
      enum: ['appetite', 'digestion', 'skin_coat', 'activity', 'behavior', 'other'],
    }).notNull(),
    text: text('text').notNull(),
    ...timestamps,
  },
  (t) => [
    index('diary_entries_dog').on(t.dogId),
    check('diary_entries_minute', sql`${t.minute} BETWEEN 0 AND 1439`),
    check(
      'diary_entries_category',
      sql`${t.category} IN ('appetite', 'digestion', 'skin_coat', 'activity', 'behavior', 'other')`,
    ),
  ],
);

export const documents = sqliteTable(
  'documents',
  {
    id: text('id').primaryKey(),
    dogId: dogReference(),
    category: text('category', {
      enum: ['pet_passport', 'insurance', 'amicus', 'pedigree', 'invoice', 'other'],
    }).notNull(),
    title: text('title').notNull(),
    date: text('date'),
    ...timestamps,
  },
  (t) => [
    index('documents_dog').on(t.dogId),
    check(
      'documents_category',
      sql`${t.category} IN ('pet_passport', 'insurance', 'amicus', 'pedigree', 'invoice', 'other')`,
    ),
  ],
);

/** Ein Bild gehört zu genau einem: Hund, Gesundheitseintrag, Tagebuch oder Dokument. */
export const attachments = sqliteTable(
  'attachments',
  {
    id: text('id').primaryKey(),
    dogId: text('dog_id').references(() => dogs.id, { onDelete: 'cascade' }),
    healthEntryId: text('health_entry_id').references(() => healthEntries.id, {
      onDelete: 'cascade',
    }),
    diaryEntryId: text('diary_entry_id').references(() => diaryEntries.id, {
      onDelete: 'cascade',
    }),
    documentId: text('document_id').references(() => documents.id, { onDelete: 'cascade' }),
    /** Pfad relativ zum Dokumentverzeichnis der App. */
    path: text('path').notNull(),
    sha256: text('sha256').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    ...timestamps,
  },
  (t) => [
    check(
      'attachments_one_parent',
      sql`(${t.dogId} IS NOT NULL) + (${t.healthEntryId} IS NOT NULL) + (${t.diaryEntryId} IS NOT NULL) + (${t.documentId} IS NOT NULL) = 1`,
    ),
  ],
);

export const reminders = sqliteTable(
  'reminders',
  {
    id: text('id').primaryKey(),
    dogId: text('dog_id').references(() => dogs.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    firstDueDate: text('first_due_date').notNull(),
    repeat: text('repeat', { enum: ['none', 'monthly', 'every_n_months', 'yearly'] }).notNull(),
    repeatMonths: integer('repeat_months'),
    leadDays: integer('lead_days').notNull(),
    doneUntil: text('done_until'),
    ...timestamps,
  },
  (t) => [
    check('reminders_repeat', sql`${t.repeat} IN ('none', 'monthly', 'every_n_months', 'yearly')`),
    check(
      'reminders_repeat_months',
      sql`(${t.repeat} = 'every_n_months') = (${t.repeatMonths} IS NOT NULL AND ${t.repeatMonths} > 0)`,
    ),
    check('reminders_lead_days', sql`${t.leadDays} BETWEEN 0 AND 365`),
  ],
);

/** Einstellungen: genau eine Zeile. Fehlt sie, gelten die Vorgaben aus src/domain. */
export const settings = sqliteTable(
  'settings',
  {
    id: text('id').primaryKey(),
    reminderMinute: integer('reminder_minute').notNull(),
    defaultLeadDays: integer('default_lead_days').notNull(),
    demoLoaded: integer('demo_loaded', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [
    check('settings_single_row', sql`${t.id} = ${sql.raw(`'${SINGLETON_ID}'`)}`),
    check('settings_reminder_minute', sql`${t.reminderMinute} BETWEEN 0 AND 1439`),
    check('settings_default_lead_days', sql`${t.defaultLeadDays} BETWEEN 0 AND 365`),
  ],
);
