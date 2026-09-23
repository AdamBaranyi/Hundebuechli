import { addAttachment, replaceDogPhoto } from '@/db/repositories/attachments';
import { createDiaryEntry } from '@/db/repositories/diary';
import { createDog } from '@/db/repositories/dogs';
import { createHealthEntry } from '@/db/repositories/health';
import { createMedication } from '@/db/repositories/medications';
import { saveOwner } from '@/db/repositories/owner';
import { saveWeight } from '@/db/repositories/weights';
import { createTestDb } from '@/db/testing';
import type { Db } from '@/db/types';

import { collectSitter, collectVet } from '../collect';
import { pdfFileName } from '../filename';
import { weightCurveSvg } from '../weight-curve';

const image = (name: string) => ({
  path: `photos/0000000${name}-0000-4000-8000-000000000000.jpg`,
  sha256: name,
  width: 1200,
  height: 900,
});

/** Statt der Datei: ein erkennbarer Platzhalter je Pfad. */
const read = async (path: string) => `inhalt-von-${path}`;
const TODAY = '2026-09-22';

describe('Daten fürs PDF', () => {
  let db: Db;
  let dogId: string;

  beforeEach(async () => {
    db = await createTestDb();
    dogId = createDog(db, {
      name: 'Bäri',
      breed: 'Whippet',
      sex: 'male',
      chipNumber: '756098123456789',
      allergies: 'Huhn',
      food: '2 × täglich 120 g',
      careNotes: 'Scheu bei Fremden.',
      vetName: 'Praxis am Bach',
      vetPhone: '000 000 00 00',
    }).id;
  });

  it('sammelt fürs Tierarzt-PDF die letzten zwölf Monate und das gewählte Tagebuch', async () => {
    replaceDogPhoto(db, dogId, image('1'));
    createHealthEntry(db, { dogId, kind: 'vaccination', date: '2025-06-01', product: 'Alt' });
    createHealthEntry(db, {
      dogId,
      kind: 'deworming',
      date: '2026-06-25',
      product: 'Milbemax',
      nextDueDate: '2026-09-25',
    });
    createMedication(db, {
      dogId,
      name: 'Apoquel',
      dose: '1 Tablette',
      times: [480],
      startDate: '2026-09-01',
    });
    saveWeight(db, { dogId, date: '2026-06-20', grams: 13200 });
    saveWeight(db, { dogId, date: '2026-09-22', grams: 13800 });
    const early = createDiaryEntry(db, {
      dogId,
      date: '2026-08-01',
      minute: 480,
      category: 'appetite',
      text: 'Zu alt',
    });
    const recent = createDiaryEntry(db, {
      dogId,
      date: '2026-09-20',
      minute: 480,
      category: 'appetite',
      text: 'Wenig gefressen.',
    });
    addAttachment(db, { diaryEntryId: recent.id }, image('2'));
    expect(early.id).not.toBe(recent.id);

    const data = await collectVet(db, dogId, TODAY, '2026-09-01', read);

    expect(data?.dog.subtitle).toBe('Whippet, Rüde');
    expect(data?.dog.facts).toContainEqual({ label: 'Chipnummer', value: '756 0981 2345 6789' });
    expect(data?.dog.photo).toBe(`inhalt-von-${image('1').path}`);
    expect(data?.health.map((row) => row.product)).toEqual(['Milbemax']);
    expect(data?.medications).toEqual([{ name: 'Apoquel', detail: '1 Tablette, 08:00' }]);
    expect(data?.weights.map((row) => row.difference)).toEqual(['+0.6 kg', '–']);
    expect(data?.weightCurve).toContain('<svg');
    expect(data?.diary.map((entry) => entry.text)).toEqual(['Wenig gefressen.']);
    expect(data?.diary[0]?.photos).toEqual([`inhalt-von-${image('2').path}`]);
  });

  it('nimmt Halterangaben ins Hundesitter-Blatt nur, wenn sie eingetragen sind', async () => {
    expect((await collectSitter(db, dogId, TODAY, read))?.owner).toEqual([]);
    saveOwner(db, { name: 'Adam', phone: '000 000 00 00' });
    const data = await collectSitter(db, dogId, TODAY, read);
    expect(data?.owner).toEqual([
      { label: 'Name', value: 'Adam' },
      { label: 'Telefon', value: '000 000 00 00' },
    ]);
    expect(data?.food).toBe('2 × täglich 120 g');
    expect(data?.vet).toContainEqual({ label: 'Name', value: 'Praxis am Bach' });
  });

  it('gibt für einen unbekannten Hund nichts zurück', async () => {
    expect(
      await collectVet(db, '00000000-0000-4000-8000-000000000009', TODAY, TODAY, read),
    ).toBeNull();
  });
});

describe('Dateiname', () => {
  it('behält Umlaute und wirft störende Zeichen weg', () => {
    expect(pdfFileName('Bäri', 'Tierarzt', '2026-09-22')).toBe('Bäri-Tierarzt-2026-09-22.pdf');
    expect(pdfFileName('Mila / Galga: "neu"', 'Vermisst', '2026-09-22')).toBe(
      'Mila-Galga-neu-Vermisst-2026-09-22.pdf',
    );
    expect(pdfFileName('../..', 'Tierarzt', '2026-09-22')).toBe('Hund-Tierarzt-2026-09-22.pdf');
  });
});

describe('Kurve im PDF', () => {
  it('braucht mindestens zwei Werte', () => {
    expect(weightCurveSvg([{ date: '2026-09-22', grams: 13800 }])).toBeNull();
    const svg = weightCurveSvg([
      { date: '2026-06-20', grams: 13200 },
      { date: '2026-09-22', grams: 13800 },
    ]);
    expect(svg).toContain('<polyline');
    expect(svg).not.toMatch(/https?:/);
  });
});
