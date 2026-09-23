/**
 * @jest-environment node
 */
import { toDate } from '../local-time';
import {
  MAX_SCHEDULED,
  planNotifications,
  reconcile,
  type MedicationInput,
  type PlanInput,
  type PlanTexts,
} from '../notifications';

const texts: PlanTexts = {
  dueTitle: (dog) => `Termin für ${dog}`,
  dueBody: (title, date) => `${title} ist am ${date} fällig.`,
  doseTitle: (dog) => `Medikament für ${dog}`,
  doseBody: (name, dose) => `${name}, ${dose}`,
};

const base: PlanInput = {
  now: '2026-09-22T10:00',
  reminderMinute: 480,
  defaultLeadDays: 7,
  dueEntries: [],
  medications: [],
};

const medication = (overrides: Partial<MedicationInput> = {}): MedicationInput => ({
  id: 'm1',
  dogName: 'Mila',
  name: 'Apoquel 16 mg',
  dose: 'halbe Tablette',
  times: [480, 1080],
  startDate: '2026-09-01',
  endDate: null,
  active: true,
  given: [],
  ...overrides,
});

const plan = (input: Partial<PlanInput>) => planNotifications({ ...base, ...input }, texts);

describe('Plan der Benachrichtigungen', () => {
  it('erinnert am Vorlauftag und am Tag der Fälligkeit, zur eingestellten Zeit', () => {
    const planned = plan({
      dueEntries: [{ id: 'e1', dogName: 'Bäri', title: 'Entwurmung', nextDueDate: '2026-10-02' }],
    });
    expect(planned.map((entry) => [entry.id, entry.at])).toEqual([
      ['due:e1:2026-09-25', '2026-09-25T08:00'],
      ['due:e1:2026-10-02', '2026-10-02T08:00'],
    ]);
    expect(planned[0]?.title).toBe('Termin für Bäri');
    expect(planned[0]?.channel).toBe('dates');
    expect(planned[0]?.target).toEqual({ kind: 'health', entryId: 'e1' });
  });

  it('nimmt den eigenen Vorlauf des Eintrags, wenn er gesetzt ist', () => {
    const planned = plan({
      dueEntries: [
        { id: 'e1', dogName: 'Bäri', title: 'Impfung', nextDueDate: '2026-10-02', leadDays: 1 },
      ],
    });
    expect(planned.map((entry) => entry.at)).toEqual(['2026-10-01T08:00', '2026-10-02T08:00']);
  });

  it('lässt Vergangenes weg: Überfälliges erinnert nicht täglich', () => {
    const planned = plan({
      now: '2026-09-22T10:00',
      dueEntries: [
        { id: 'alt', dogName: 'Bäri', title: 'Entwurmung', nextDueDate: '2026-09-10' },
        { id: 'heute', dogName: 'Bäri', title: 'Impfung', nextDueDate: '2026-09-22' },
      ],
    });
    expect(planned).toEqual([]);
  });

  it('hält das Monatsende und den Schalttag fest', () => {
    const planned = plan({
      now: '2028-02-01T09:00',
      dueEntries: [
        { id: 'e1', dogName: 'Bäri', title: 'Impfung', nextDueDate: '2028-02-29', leadDays: 30 },
      ],
    });
    expect(planned.map((entry) => entry.at)).toEqual(['2028-02-29T08:00']);
  });

  it('plant Medikamente zu jeder Uhrzeit, die nächste zuerst', () => {
    const planned = plan({ medications: [medication()] });
    expect(planned.slice(0, 3).map((entry) => [entry.id, entry.at])).toEqual([
      ['dose:m1:2026-09-22T18:00', '2026-09-22T18:00'],
      ['dose:m1:2026-09-23T08:00', '2026-09-23T08:00'],
      ['dose:m1:2026-09-23T18:00', '2026-09-23T18:00'],
    ]);
    expect(planned[0]?.channel).toBe('medication');
    expect(planned[0]?.target).toEqual({
      kind: 'dose',
      medicationId: 'm1',
      scheduledAt: '2026-09-22T18:00',
    });
  });

  it('überspringt, was schon gegeben wurde, und lässt beendete und ruhende weg', () => {
    const planned = plan({
      medications: [
        medication({ given: ['2026-09-22T18:00'] }),
        medication({ id: 'm2', active: false }),
        medication({ id: 'm3', endDate: '2026-09-21' }),
        medication({ id: 'm4', startDate: '2026-09-24', times: [600] }),
      ],
    });
    expect(planned[0]?.id).toBe('dose:m1:2026-09-23T08:00');
    expect(planned.filter((entry) => entry.id.startsWith('dose:m2'))).toEqual([]);
    expect(planned.filter((entry) => entry.id.startsWith('dose:m3'))).toEqual([]);
    expect(planned.find((entry) => entry.id.startsWith('dose:m4'))?.at).toBe('2026-09-24T10:00');
  });

  it('plant höchstens 60 und dann die frühesten', () => {
    const planned = plan({
      medications: [medication({ times: [480, 600, 720, 840, 960, 1080] })],
      dueEntries: [
        { id: 'e1', dogName: 'Bäri', title: 'Impfung', nextDueDate: '2026-09-30', leadDays: 0 },
      ],
    });
    expect(planned).toHaveLength(MAX_SCHEDULED);
    expect(planned.map((entry) => entry.at)).toEqual([...planned.map((entry) => entry.at)].sort());
    expect(planned.at(-1)?.at.localeCompare(planned[0]?.at ?? '')).toBeGreaterThan(0);
    expect(planned.some((entry) => entry.id === 'due:e1:2026-09-30')).toBe(true);
  });

  it('bleibt bei der Zeitumstellung acht Uhr morgens', () => {
    const planned = plan({
      now: '2026-10-20T09:00',
      dueEntries: [
        { id: 'e1', dogName: 'Bäri', title: 'Impfung', nextDueDate: '2026-10-26', leadDays: 0 },
      ],
    });
    const moment = toDate(planned[0]?.at ?? '');
    // Europe/Zurich stellt am 25.10.2026 auf Winterzeit um.
    expect(moment.getHours()).toBe(8);
    expect(moment.toISOString()).toBe('2026-10-26T07:00:00.000Z');
  });
});

describe('Abgleich', () => {
  const planned = plan({
    dueEntries: [{ id: 'e1', dogName: 'Bäri', title: 'Impfung', nextDueDate: '2026-10-02' }],
  });

  it('plant, was fehlt', () => {
    expect(reconcile(planned, [])).toEqual({ cancel: [], schedule: planned });
  });

  it('ändert nichts, wenn schon alles steht', () => {
    const scheduled = planned.map((entry) => ({ id: entry.id, at: entry.at }));
    expect(reconcile(planned, scheduled)).toEqual({ cancel: [], schedule: [] });
    const second = reconcile(planned, scheduled);
    expect(second).toEqual({ cancel: [], schedule: [] });
  });

  it('löscht, was niemand mehr braucht', () => {
    const scheduled = [{ id: 'due:weg:2026-09-30', at: '2026-09-30T08:00' }];
    expect(reconcile(planned, scheduled)).toEqual({
      cancel: ['due:weg:2026-09-30'],
      schedule: planned,
    });
  });

  it('plant neu, wenn sich die Uhrzeit geändert hat', () => {
    const scheduled = planned.map((entry) => ({ id: entry.id, at: '2026-10-02T07:00' }));
    const result = reconcile(planned, scheduled);
    expect(result.cancel).toEqual(scheduled.map((entry) => entry.id));
    expect(result.schedule).toEqual(planned);
  });
});
