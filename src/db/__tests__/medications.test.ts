import {
  createMedication,
  deleteMedication,
  listDoseSlots,
  listDosesFrom,
  listMedications,
  listRunningMedications,
  logDose,
  undoDose,
  updateMedication,
} from '../repositories/medications';
import { createDog, setDogArchived } from '../repositories/dogs';
import { createTestDb } from '../testing';
import type { Db } from '../types';

describe('Repository Medikamente', () => {
  let db: Db;
  let dogId: string;

  beforeEach(async () => {
    db = await createTestDb();
    dogId = createDog(db, { name: 'Mila' }).id;
  });

  const apoquel = () => ({
    dogId,
    name: 'Apoquel 16 mg',
    dose: 'halbe Tablette',
    times: [1080, 480],
    startDate: '2026-09-01',
  });

  it('legt ein Medikament an, ordnet die Uhrzeiten und wirft doppelte weg', () => {
    const medication = createMedication(db, { ...apoquel(), times: [1080, 480, 480] });
    expect(medication.times).toEqual([480, 1080]);
    expect(medication.active).toBe(true);
    expect(listMedications(db, dogId)).toHaveLength(1);
  });

  it('nimmt nur laufende Medikamente in den Fahrplan', () => {
    createMedication(db, apoquel());
    createMedication(db, { ...apoquel(), name: 'Beendet', endDate: '2026-09-21' });
    createMedication(db, { ...apoquel(), name: 'Ruht', active: false });
    createMedication(db, { ...apoquel(), name: 'Beginnt später', startDate: '2026-10-01' });
    expect(listRunningMedications(db, '2026-09-22').map((m) => m.name)).toEqual(['Apoquel 16 mg']);
  });

  it('lässt archivierte Hunde weg', () => {
    createMedication(db, apoquel());
    setDogArchived(db, dogId, true);
    expect(listRunningMedications(db, '2026-09-22')).toEqual([]);
  });

  it('zeigt den Fahrplan des Tages mit Uhrzeit und Gabe', () => {
    const medication = createMedication(db, apoquel());
    logDose(db, medication.id, '2026-09-22T08:00', '2026-09-22T08:04');
    expect(listDoseSlots(db, '2026-09-22')).toEqual([
      expect.objectContaining({ minute: 480, givenAt: '2026-09-22T08:04' }),
      expect.objectContaining({ minute: 1080, givenAt: null }),
    ]);
  });

  it('schreibt eine Gabe nur einmal und nimmt sie wieder zurück', () => {
    const medication = createMedication(db, apoquel());
    const first = logDose(db, medication.id, '2026-09-22T08:00', '2026-09-22T08:04');
    const second = logDose(db, medication.id, '2026-09-22T08:00', '2026-09-22T09:30');
    expect(second.id).toBe(first.id);
    expect(second.givenAt).toBe('2026-09-22T08:04');
    expect(listDosesFrom(db, '2026-09-22T00:00')).toHaveLength(1);

    undoDose(db, medication.id, '2026-09-22T08:00');
    expect(listDosesFrom(db, '2026-09-22T00:00')).toEqual([]);
  });

  it('ändert ein Medikament und löscht es samt Gaben', () => {
    const medication = createMedication(db, apoquel());
    logDose(db, medication.id, '2026-09-22T08:00', '2026-09-22T08:04');
    const changed = updateMedication(db, medication.id, { ...apoquel(), times: [600] });
    expect(changed.times).toEqual([600]);

    deleteMedication(db, medication.id);
    expect(listMedications(db, dogId)).toEqual([]);
    expect(listDosesFrom(db, '2026-09-01T00:00')).toEqual([]);
  });
});
