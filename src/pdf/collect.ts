import { diaryCategories } from '@/content/diary';
import { dogsText } from '@/content/dogs';
import { formatAge, formatLocal } from '@/content/format';
import { healthKinds } from '@/content/health';
import { medicationsText } from '@/content/medications';
import { pdfText } from '@/content/pdf';
import { dogPhoto, listAttachments } from '@/db/repositories/attachments';
import { listDiaryEntries } from '@/db/repositories/diary';
import { type Dog, getDog } from '@/db/repositories/dogs';
import { listHealthEntries } from '@/db/repositories/health';
import { listRunningMedications } from '@/db/repositories/medications';
import { getOwner } from '@/db/repositories/owner';
import { listWeightRows } from '@/db/repositories/weights';
import type { Db } from '@/db/types';
import { addDays, addMonths } from '@/domain/calendar';
import { formatChipNumber } from '@/domain/chip';
import { ageOf } from '@/domain/dog-age';
import type { LocalDate } from '@/domain/local-date';

import type { PdfDog, PdfFact, PdfMedication, SitterPdfData, VetPdfData } from './types';
import { weightCurveSvg } from './weight-curve';

/** Liest ein Foto als Base64; die Ablage kommt von aussen, damit Tests ohne Dateien laufen. */
export type ReadPhoto = (path: string) => Promise<string | null>;

function fact(label: string, value: string | null | undefined): PdfFact[] {
  return value ? [{ label, value }] : [];
}

async function pdfDog(db: Db, dog: Dog, today: LocalDate, read: ReadPhoto): Promise<PdfDog> {
  const age = ageOf(dog, today);
  const photo = dogPhoto(db, dog.id);
  const f = pdfText.facts;
  return {
    name: dog.name,
    subtitle: [dog.breed, dog.sex ? dogsText.sex[dog.sex] : null, age ? formatAge(age) : null]
      .filter(Boolean)
      .join(', '),
    facts: [
      ...fact(f.chip, dog.chipNumber ? formatChipNumber(dog.chipNumber) : null),
      ...fact(f.born, dog.birthDate ? formatLocal.long(dog.birthDate) : dog.birthYear?.toString()),
      ...fact(f.color, dog.colorMarkings),
      ...fact(f.allergies, dog.allergies),
      ...fact(
        f.insurance,
        [dog.insuranceName, dog.insurancePolicy].filter(Boolean).join(', ') || null,
      ),
    ],
    photo: photo ? await read(photo.path) : null,
  };
}

function medications(db: Db, dogId: string, today: LocalDate): PdfMedication[] {
  return listRunningMedications(db, today)
    .filter((medication) => medication.dogId === dogId)
    .map((medication) => ({
      name: medication.name,
      detail: medicationsText.summary(
        medication.dose,
        medication.times.map((minute) => formatLocal.time(minute)),
      ),
    }));
}

/** Tierarzt-PDF: alles Medizinische, Tagebuch ab `diaryFrom`. */
export async function collectVet(
  db: Db,
  dogId: string,
  today: LocalDate,
  diaryFrom: LocalDate,
  read: ReadPhoto,
): Promise<VetPdfData | null> {
  const dog = getDog(db, dogId);
  if (!dog) return null;
  const yearAgo = addMonths(today, -12);
  const weightRows = listWeightRows(db, dogId);
  const diary = listDiaryEntries(db, dogId).filter(
    (entry) => entry.date >= diaryFrom && entry.date <= today,
  );
  return {
    dog: await pdfDog(db, dog, today, read),
    medications: medications(db, dogId, today),
    health: listHealthEntries(db, dogId)
      .filter((entry) => entry.date >= yearAgo)
      .map((entry) => ({
        kind: healthKinds[entry.kind],
        date: formatLocal.long(entry.date),
        product: entry.product ?? '–',
        next: entry.completedByEntryId
          ? '–'
          : entry.nextDueDate
            ? formatLocal.long(entry.nextDueDate)
            : '–',
        due: !entry.completedByEntryId && !!entry.nextDueDate && entry.nextDueDate < today,
      })),
    weights: [...weightRows].reverse().map((row) => ({
      date: formatLocal.long(row.date),
      weight: formatLocal.kilograms(row.grams),
      difference:
        row.differenceGrams === null
          ? '–'
          : `${row.differenceGrams >= 0 ? '+' : '−'}${formatLocal.kilograms(Math.abs(row.differenceGrams))}`,
    })),
    weightCurve: weightCurveSvg(weightRows.map((row) => ({ date: row.date, grams: row.grams }))),
    diaryPeriod: `${formatLocal.long(diaryFrom)} bis ${formatLocal.long(today)}`,
    diary: await Promise.all(
      diary.map(async (entry) => ({
        when: `${formatLocal.long(entry.date)}, ${formatLocal.time(entry.minute)}`,
        category: diaryCategories[entry.category],
        text: entry.text,
        photos: (
          await Promise.all(
            listAttachments(db, { diaryEntryId: entry.id }).map((photo) => read(photo.path)),
          )
        ).filter((photo): photo is string => photo !== null),
      })),
    ),
  };
}

/** Hundesitter-Blatt: Alltag statt Befunde, dazu wie man mich erreicht. */
export async function collectSitter(
  db: Db,
  dogId: string,
  today: LocalDate,
  read: ReadPhoto,
): Promise<SitterPdfData | null> {
  const dog = getDog(db, dogId);
  if (!dog) return null;
  const owner = getOwner(db);
  const f = pdfText.facts;
  return {
    dog: await pdfDog(db, dog, today, read),
    food: dog.food,
    medications: medications(db, dogId, today),
    care: dog.careNotes,
    allergies: dog.allergies,
    vet: [
      ...fact(f.name, dog.vetName),
      ...fact(f.phone, dog.vetPhone),
      ...fact(f.address, dog.vetAddress),
    ],
    owner: owner
      ? [
          ...fact(f.name, owner.name),
          ...fact(f.phone, owner.phone),
          ...fact(f.email, owner.email),
          ...fact(f.address, owner.address),
        ]
      : [],
  };
}

/** Wie weit das Tagebuch im Tierarzt-PDF zurückreicht. */
export const DIARY_PERIODS = [30, 90, 365] as const;

export function diaryStart(today: LocalDate, days: number): LocalDate {
  return addDays(today, -days);
}
