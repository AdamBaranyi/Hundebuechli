import { dogPhoto } from '@/db/repositories/attachments';
import { listDiaryEntries } from '@/db/repositories/diary';
import { createDog, listDogs } from '@/db/repositories/dogs';
import { listOpenDue } from '@/db/repositories/health';
import { listDoseSlots } from '@/db/repositories/medications';
import { getSettings } from '@/db/repositories/settings';
import { listWeights } from '@/db/repositories/weights';
import { createTestDb } from '@/db/testing';
import { dueBucket } from '@/domain/due';
import { isValidChipNumber } from '@/domain/chip';

import { BAERI_ID, loadDemoData, MILA_ID, removeDemoData } from '../demo-data';

const TODAY = '2026-09-22';
const photo = (name: string) => ({
  path: `photos/${name}.jpg`,
  sha256: name,
  width: 960,
  height: 960,
});

describe('Beispieldaten', () => {
  it('zeigen unter «Als Nächstes» Überfälliges, Heute, Diese Woche und Später', async () => {
    const db = await createTestDb();
    loadDemoData(db, TODAY, { baeri: photo('baeri'), mila: photo('mila') });

    expect(listDogs(db).map((dog) => dog.name)).toEqual(['Bäri', 'Mila']);
    const buckets = new Set(listOpenDue(db).map((entry) => dueBucket(entry.nextDueDate, TODAY)));
    expect(buckets).toEqual(new Set(['overdue', 'thisWeek', 'later']));
    expect(listDoseSlots(db, TODAY).map((slot) => slot.minute)).toEqual([480, 1080]);
    expect(listWeights(db, BAERI_ID)).toHaveLength(12);
    expect(listWeights(db, MILA_ID).at(-1)?.date).toBe(TODAY);
    expect(listDiaryEntries(db, MILA_ID)).toHaveLength(3);
    expect(dogPhoto(db, BAERI_ID)?.path).toBe('photos/baeri.jpg');
    expect(getSettings(db).demoLoaded).toBe(true);
  });

  it('tragen keine echten Nummern: Chip gültig gebaut, Telefon erkennbar ungültig', async () => {
    const db = await createTestDb();
    loadDemoData(db, TODAY, { baeri: null, mila: null });
    for (const dog of listDogs(db)) {
      expect(isValidChipNumber(dog.chipNumber ?? '')).toBe(true);
      expect(dog.vetPhone?.startsWith('000')).toBe(true);
    }
  });

  it('lassen sich entfernen, ohne eigene Hunde anzutasten', async () => {
    const db = await createTestDb();
    const own = createDog(db, { name: 'Jupiter' }).id;
    loadDemoData(db, TODAY, { baeri: photo('baeri'), mila: null });

    const { attachmentPaths } = removeDemoData(db);

    expect(listDogs(db).map((dog) => dog.id)).toEqual([own]);
    expect(attachmentPaths).toEqual(['photos/baeri.jpg']);
    expect(getSettings(db).demoLoaded).toBe(false);
  });
});
