import { replaceDogPhoto, type StoredImage } from '@/db/repositories/attachments';
import { createDiaryEntry } from '@/db/repositories/diary';
import { createDocument } from '@/db/repositories/documents';
import { createDog, deleteDog, getDog } from '@/db/repositories/dogs';
import { completeHealthEntry, createHealthEntry } from '@/db/repositories/health';
import { createMedication } from '@/db/repositories/medications';
import { updateSettings } from '@/db/repositories/settings';
import { saveWeight } from '@/db/repositories/weights';
import type { Db } from '@/db/types';
import { addDays, addMonths } from '@/domain/calendar';
import type { HealthKind } from '@/domain/health';
import type { LocalDate } from '@/domain/local-date';

import { BAERI, BAERI_ID, MILA, MILA_ID, PRACTICE } from './demo-dogs';

/*
 * Zwei erfundene Windhunde mit einem Jahr Geschichte, alles relativ zu heute:
 * So steht immer etwas unter «Überfällig», «Diese Woche» und «Später», und
 * die Kurven reichen bis heute. Telefonnummern sind erkennbar ungültig, die
 * Praxis ist erfunden (Zefix, 23.09.2026: kein Eintrag «Rehbach»).
 */

export type DemoPhotos = { baeri: StoredImage | null; mila: StoredImage | null };

/** Eine Reihe erledigter Behandlungen im Abstand von `months`; die letzte bleibt offen. */
function history(
  db: Db,
  dogId: string,
  treatment: { kind: HealthKind; product: string; months: number },
  from: LocalDate,
  today: LocalDate,
) {
  const { kind, product, months } = treatment;
  let entry = createHealthEntry(db, {
    dogId,
    kind,
    date: from,
    product,
    nextDueDate: addMonths(from, months),
    repeatMonths: months,
  });
  for (let done = addMonths(from, months); done <= today; done = addMonths(done, months)) {
    entry = completeHealthEntry(db, entry.id, done);
  }
  return entry;
}

function weightsOf(db: Db, dogId: string, today: LocalDate, grams: readonly number[]) {
  grams.forEach((value, index) => {
    saveWeight(db, { dogId, date: addMonths(today, index - (grams.length - 1)), grams: value });
  });
}

/**
 * Legt Bäri und Mila an; ihre Fotos kommen als schon abgelegte Bilder dazu.
 * Ohne umschliessende Transaktion: Die Repositories öffnen selbst welche, und
 * SQLite kennt keine verschachtelten.
 */
export function loadDemoData(db: Db, today: LocalDate, photos: DemoPhotos): void {
  {
    const baeri = createDog(db, { ...BAERI(today), ...PRACTICE }, BAERI_ID).id;
    const mila = createDog(db, { ...MILA(today), ...PRACTICE }, MILA_ID).id;
    if (photos.baeri) replaceDogPhoto(db, baeri, photos.baeri);
    if (photos.mila) replaceDogPhoto(db, mila, photos.mila);

    // Bäri: Impfung bald, Entwurmung diese Woche, Zeckenschutz überfällig.
    createHealthEntry(db, {
      dogId: baeri,
      kind: 'vaccination',
      date: addMonths(today, -11),
      product: 'Nobivac DHPPi/L4',
      nextDueDate: addMonths(today, 1),
      repeatMonths: 12,
    });
    history(
      db,
      baeri,
      { kind: 'deworming', product: 'Milbemax', months: 3 },
      addDays(addMonths(today, -12), 3),
      today,
    );
    createHealthEntry(db, {
      dogId: baeri,
      kind: 'parasite_protection',
      date: addDays(addMonths(today, -3), -5),
      product: 'Bravecto',
      nextDueDate: addDays(today, -5),
      repeatMonths: 3,
    });
    createHealthEntry(db, {
      dogId: baeri,
      kind: 'vet_visit',
      date: addDays(today, -20),
      product: 'Ohrenkontrolle',
      note: 'Ohren sauber, nächste Kontrolle bei Bedarf.',
    });
    weightsOf(
      db,
      baeri,
      today,
      [13200, 13300, 13300, 13500, 13400, 13600, 13500, 13700, 13600, 13500, 13700, 13800],
    );
    createDiaryEntry(db, {
      dogId: baeri,
      date: addDays(today, -6),
      minute: 7 * 60 + 30,
      category: 'activity',
      text: 'Eine Stunde Freilauf auf dem eingezäunten Feld, danach müde und zufrieden.',
    });
    createDocument(db, { dogId: baeri, category: 'pet_passport', title: 'Heimtierausweis' });

    // Mila: Juckreiz, Tierarztbesuch, seither Apoquel.
    createHealthEntry(db, {
      dogId: mila,
      kind: 'vaccination',
      date: addMonths(today, -2),
      product: 'Tollwut',
      nextDueDate: addMonths(today, 10),
      repeatMonths: 12,
    });
    history(
      db,
      mila,
      { kind: 'deworming', product: 'Drontal', months: 3 },
      addDays(addMonths(today, -7), 10),
      today,
    );
    createDiaryEntry(db, {
      dogId: mila,
      date: addDays(today, -18),
      minute: 21 * 60,
      category: 'skin_coat',
      text: 'Kratzt sich am Bauch und an den Pfoten, vor allem abends.',
    });
    createDiaryEntry(db, {
      dogId: mila,
      date: addDays(today, -15),
      minute: 8 * 60,
      category: 'appetite',
      text: 'Frisst normal, trinkt etwas mehr als sonst.',
    });
    createHealthEntry(db, {
      dogId: mila,
      kind: 'vet_visit',
      date: addDays(today, -12),
      product: 'Juckreiz',
      note: 'Verdacht auf Umweltallergie. Apoquel für vier Wochen, dann Kontrolle.',
      nextDueDate: addDays(today, 16),
    });
    createMedication(db, {
      dogId: mila,
      name: 'Apoquel 16 mg',
      dose: 'halbe Tablette',
      times: [480, 1080],
      startDate: addDays(today, -12),
      endDate: addDays(today, 16),
    });
    createDiaryEntry(db, {
      dogId: mila,
      date: addDays(today, -3),
      minute: 19 * 60 + 15,
      category: 'skin_coat',
      text: 'Kratzt deutlich weniger. Fell am Bauch wächst nach.',
    });
    weightsOf(db, mila, today, [20200, 20400, 20500, 20700, 20800, 21000, 21100]);
    createDocument(db, {
      dogId: mila,
      category: 'insurance',
      title: 'Police Tierversicherung',
      date: addMonths(today, -9),
    });
  }
  updateSettings(db, { demoLoaded: true });
}

/** Entfernt nur die Beispielhunde; eigene Hunde bleiben. Zurück: Dateien zum Löschen. */
export function removeDemoData(db: Db): { attachmentPaths: string[] } {
  const paths: string[] = [];
  for (const dog of [BAERI_ID, MILA_ID]) {
    if (getDog(db, dog)) paths.push(...deleteDog(db, dog).attachmentPaths);
  }
  updateSettings(db, { demoLoaded: false });
  return { attachmentPaths: paths };
}

export { BAERI_ID, MILA_ID };
