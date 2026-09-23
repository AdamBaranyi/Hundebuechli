import { healthKinds } from '@/content/health';
import { notificationsText } from '@/content/notifications';
import { listOpenDue } from '@/db/repositories/health';
import { listDosesFrom, listMedicationsBetween } from '@/db/repositories/medications';
import { getSettings } from '@/db/repositories/settings';
import type { Db } from '@/db/types';
import { addDays } from '@/domain/calendar';
import { toLocalDate } from '@/domain/local-date';
import { nowLocal } from '@/domain/local-time';
import {
  MEDICATION_HORIZON_DAYS,
  type PlanInput,
  type PlanTexts,
  type PlannedNotification,
  planNotifications,
  reconcile,
} from '@/domain/notifications';

import type { NotificationPort } from './types';

const texts: PlanTexts = {
  dueTitle: notificationsText.dueTitle,
  dueBody: notificationsText.dueBody,
  doseTitle: notificationsText.doseTitle,
  doseBody: notificationsText.doseBody,
};

/** Der Datenstand, aus dem der Plan entsteht. */
export function planInputFrom(db: Db, now: Date): PlanInput {
  const settings = getSettings(db);
  const today = toLocalDate(now);
  const horizon = addDays(today, MEDICATION_HORIZON_DAYS);
  const doses = listDosesFrom(db, `${today}T00:00`);
  const givenByMedication = new Map<string, string[]>();
  for (const dose of doses) {
    givenByMedication.set(dose.medicationId, [
      ...(givenByMedication.get(dose.medicationId) ?? []),
      dose.scheduledAt,
    ]);
  }
  return {
    now: nowLocal(now),
    reminderMinute: settings.reminderMinute,
    defaultLeadDays: settings.defaultLeadDays,
    dueEntries: listOpenDue(db).map((entry) => ({
      id: entry.id,
      dogName: entry.dogName,
      title: entry.product ?? healthKinds[entry.kind],
      nextDueDate: entry.nextDueDate,
    })),
    medications: listMedicationsBetween(db, today, horizon).map((medication) => ({
      id: medication.id,
      dogName: medication.dogName,
      name: medication.name,
      dose: medication.dose,
      times: medication.times,
      startDate: medication.startDate,
      endDate: medication.endDate,
      active: medication.active,
      given: givenByMedication.get(medication.id) ?? [],
    })),
  };
}

export function planFor(db: Db, now: Date): PlannedNotification[] {
  return planNotifications(planInputFrom(db, now), texts);
}

export type SyncResult = { cancelled: number; scheduled: number; skipped: 'permission' | null };

/**
 * Der Abgleich: plant, was fehlt, und löscht, was niemand mehr braucht.
 * Er läuft beim Start, nach jeder Änderung und beim Zurückkommen in die App.
 * Ohne Erlaubnis wird nichts geplant – gefragt wird an der Stelle, wo die
 * erste Erinnerung entsteht, nicht hier.
 */
export async function syncNotifications(
  db: Db,
  port: NotificationPort,
  now: Date,
): Promise<SyncResult> {
  const permission = await port.getPermission();
  if (permission !== 'granted') {
    // Ohne Erlaubnis liegt nichts beim System; dann gibt es auch nichts zu löschen.
    return { cancelled: 0, scheduled: 0, skipped: 'permission' };
  }
  await port.prepare();
  const planned = planFor(db, now);
  const { cancel, schedule } = reconcile(planned, await port.getScheduled());
  if (cancel.length > 0) await port.cancel(cancel);
  if (schedule.length > 0) await port.schedule(schedule);
  return { cancelled: cancel.length, scheduled: schedule.length, skipped: null };
}
