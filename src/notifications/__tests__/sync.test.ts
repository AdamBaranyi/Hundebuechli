import { createDog, deleteDog, setDogArchived } from '@/db/repositories/dogs';
import { createHealthEntry } from '@/db/repositories/health';
import { createMedication, logDose } from '@/db/repositories/medications';
import { updateSettings } from '@/db/repositories/settings';
import { createTestDb } from '@/db/testing';
import type { Db } from '@/db/types';
import type { PlannedNotification, ScheduledNotification } from '@/domain/notifications';

import { planFor, syncNotifications } from '../sync';
import type { NotificationPort, PermissionState } from '../types';

/** Eine Attrappe des Geräts: merkt sich, was geplant und gelöscht wurde. */
function fakePort(permission: PermissionState = 'granted') {
  const state = new Map<string, ScheduledNotification>();
  const calls = { cancelled: [] as string[], scheduled: [] as string[], prepared: 0 };
  const port: NotificationPort = {
    prepare: async () => void (calls.prepared += 1),
    getPermission: async () => permission,
    requestPermission: async () => permission,
    getScheduled: async () => [...state.values()],
    cancel: async (ids) => {
      calls.cancelled.push(...ids);
      for (const id of ids) state.delete(id);
    },
    schedule: async (plans: PlannedNotification[]) => {
      calls.scheduled.push(...plans.map((plan) => plan.id));
      for (const plan of plans) state.set(plan.id, { id: plan.id, at: plan.at });
    },
    onResponse: () => () => undefined,
    lastResponse: async () => null,
  };
  return { port, state, calls };
}

const NOW = new Date(2026, 8, 22, 10, 0);

describe('Abgleich mit dem Gerät', () => {
  let db: Db;
  let dogId: string;

  beforeEach(async () => {
    db = await createTestDb();
    dogId = createDog(db, { name: 'Bäri' }).id;
  });

  it('plant Termine und Medikamente aus dem Datenstand', async () => {
    createHealthEntry(db, {
      dogId,
      kind: 'deworming',
      date: '2026-06-25',
      product: 'Milbemax',
      nextDueDate: '2026-10-02',
      repeatMonths: 3,
    });
    createMedication(db, {
      dogId,
      name: 'Apoquel 16 mg',
      dose: 'halbe Tablette',
      times: [480],
      startDate: '2026-09-01',
    });
    const { port, calls } = fakePort();

    const result = await syncNotifications(db, port, NOW);

    expect(result).toEqual({ cancelled: 0, scheduled: expect.any(Number), skipped: null });
    expect(calls.prepared).toBe(1);
    expect(calls.scheduled.some((id) => id.startsWith('due:'))).toBe(true);
    expect(calls.scheduled.some((id) => id.startsWith('dose:'))).toBe(true);

    const planned = planFor(db, NOW);
    expect(planned.find((plan) => plan.id.startsWith('due:'))).toMatchObject({
      title: 'Termin für Bäri',
      body: 'Milbemax ist am 2. Oktober 2026 fällig.',
      channel: 'dates',
    });
    expect(planned.find((plan) => plan.id.startsWith('dose:'))).toMatchObject({
      title: 'Medikament für Bäri',
      body: 'Apoquel 16 mg, halbe Tablette',
      channel: 'medication',
    });
  });

  it('ändert beim zweiten Lauf nichts mehr', async () => {
    createMedication(db, {
      dogId,
      name: 'Apoquel',
      dose: '1 Tablette',
      times: [480, 1080],
      startDate: '2026-09-01',
    });
    const { port, calls } = fakePort();

    await syncNotifications(db, port, NOW);
    const afterFirst = calls.scheduled.length;
    const second = await syncNotifications(db, port, NOW);

    expect(second).toEqual({ cancelled: 0, scheduled: 0, skipped: null });
    expect(calls.scheduled).toHaveLength(afterFirst);
    expect(calls.cancelled).toEqual([]);
  });

  it('löscht die Erinnerung, sobald die Gabe eingetragen ist', async () => {
    const medication = createMedication(db, {
      dogId,
      name: 'Apoquel',
      dose: '1 Tablette',
      times: [1080],
      startDate: '2026-09-01',
    });
    const { port, calls, state } = fakePort();
    await syncNotifications(db, port, NOW);
    expect(state.has(`dose:${medication.id}:2026-09-22T18:00`)).toBe(true);

    logDose(db, medication.id, '2026-09-22T18:00', '2026-09-22T17:55');
    await syncNotifications(db, port, NOW);

    expect(calls.cancelled).toEqual([`dose:${medication.id}:2026-09-22T18:00`]);
    expect(state.has(`dose:${medication.id}:2026-09-22T18:00`)).toBe(false);
  });

  it('räumt alles weg, wenn der Hund archiviert wird', async () => {
    createHealthEntry(db, {
      dogId,
      kind: 'vaccination',
      date: '2026-01-02',
      nextDueDate: '2026-10-02',
    });
    const { port, state } = fakePort();
    await syncNotifications(db, port, NOW);
    expect(state.size).toBeGreaterThan(0);

    setDogArchived(db, dogId, true);
    await syncNotifications(db, port, NOW);

    expect(state.size).toBe(0);
  });

  it('lässt nach dem Löschen eines Hundes keine Benachrichtigung zurück', async () => {
    createHealthEntry(db, {
      dogId,
      kind: 'vaccination',
      date: '2026-01-02',
      nextDueDate: '2026-10-02',
    });
    createMedication(db, {
      dogId,
      name: 'Apoquel',
      dose: '1 Tablette',
      times: [480, 1080],
      startDate: '2026-09-01',
    });
    const { port, state } = fakePort();
    await syncNotifications(db, port, NOW);
    expect(state.size).toBeGreaterThan(0);

    deleteDog(db, dogId);
    await syncNotifications(db, port, NOW);

    expect(state.size).toBe(0);
  });

  it('plant neu, wenn die Uhrzeit der Erinnerungen wechselt', async () => {
    const entry = createHealthEntry(db, {
      dogId,
      kind: 'vaccination',
      date: '2026-01-02',
      nextDueDate: '2026-10-02',
    });
    const { port, state } = fakePort();
    await syncNotifications(db, port, NOW);
    expect(state.get(`due:${entry.id}:2026-09-25`)?.at).toBe('2026-09-25T08:00');

    updateSettings(db, { reminderMinute: 1140 });
    await syncNotifications(db, port, NOW);

    expect(state.get(`due:${entry.id}:2026-09-25`)?.at).toBe('2026-09-25T19:00');
  });

  it('plant nichts ohne Erlaubnis und fragt auch nicht von sich aus', async () => {
    createHealthEntry(db, {
      dogId,
      kind: 'vaccination',
      date: '2026-01-02',
      nextDueDate: '2026-10-02',
    });
    const { port, calls } = fakePort('denied');

    expect(await syncNotifications(db, port, NOW)).toEqual({
      cancelled: 0,
      scheduled: 0,
      skipped: 'permission',
    });
    expect(calls.scheduled).toEqual([]);
    expect(calls.prepared).toBe(0);
  });
});
