import { count } from 'drizzle-orm';

import { addAttachment, replaceDogPhoto } from '../repositories/attachments';
import { createDiaryEntry } from '../repositories/diary';
import { createDog } from '../repositories/dogs';
import { deleteEverything } from '../repositories/everything';
import { createHealthEntry } from '../repositories/health';
import { createMedication, logDose } from '../repositories/medications';
import { getOwner, saveOwner } from '../repositories/owner';
import { getSettings, updateSettings } from '../repositories/settings';
import { saveWeight } from '../repositories/weights';
import * as schema from '../schema';
import { createTestDb } from '../testing';

const image = (name: string) => ({
  path: `photos/${name}.jpg`,
  sha256: name,
  width: 1200,
  height: 900,
});

describe('Alle Daten löschen', () => {
  it('hinterlässt keine einzige Zeile und nennt jede Datei', async () => {
    const db = await createTestDb();
    const dogId = createDog(db, { name: 'Bäri' }).id;
    replaceDogPhoto(db, dogId, image('hund'));
    const entry = createHealthEntry(db, { dogId, kind: 'vet_visit', date: '2026-09-20' });
    addAttachment(db, { healthEntryId: entry.id }, image('befund'));
    const diary = createDiaryEntry(db, {
      dogId,
      date: '2026-09-20',
      minute: 480,
      category: 'other',
      text: 'Notiz',
    });
    addAttachment(db, { diaryEntryId: diary.id }, image('tagebuch'));
    const medication = createMedication(db, {
      dogId,
      name: 'Apoquel',
      dose: '1',
      times: [480],
      startDate: '2026-09-01',
    });
    logDose(db, medication.id, '2026-09-20T08:00', '2026-09-20T08:05');
    saveWeight(db, { dogId, date: '2026-09-20', grams: 13800 });
    saveOwner(db, { name: 'Adam' });
    updateSettings(db, { reminderMinute: 1140 });

    const { attachmentPaths } = deleteEverything(db);

    expect([...attachmentPaths].sort()).toEqual([
      'photos/befund.jpg',
      'photos/hund.jpg',
      'photos/tagebuch.jpg',
    ]);
    const tables = [
      schema.dogs,
      schema.healthEntries,
      schema.medications,
      schema.doseLog,
      schema.weights,
      schema.diaryEntries,
      schema.documents,
      schema.attachments,
      schema.reminders,
      schema.owner,
      schema.settings,
    ];
    for (const table of tables) {
      expect(db.select({ value: count() }).from(table).get()?.value).toBe(0);
    }
    expect(getOwner(db)).toBeNull();
    expect(getSettings(db).reminderMinute).toBe(480);
  });
});
