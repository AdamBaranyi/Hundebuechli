import { addDays } from './calendar';
import { reminderDays } from './due';
import type { LocalDate } from './local-date';
import { atMinute, type LocalDateTime } from './local-time';

/*
 * Benachrichtigungen sind eine Ableitung des Datenstands: Aus Terminen,
 * Medikamenten und den Einstellungen berechnet `planNotifications`, was
 * geplant sein soll; `reconcile` vergleicht das mit dem, was das System
 * wirklich geplant hat. Beides sind reine Funktionen – prüfbar ohne Gerät.
 *
 * Eigene Erinnerungen (Tabelle `reminders`) kommen dazu, sobald es einen
 * Bildschirm gibt, der welche anlegt.
 */

/** iOS behält nur die 64 nächsten; wir lassen Luft und planen die nächsten 60. */
export const MAX_SCHEDULED = 60;

/** So weit voraus werden Medikamentenzeiten geplant. */
export const MEDICATION_HORIZON_DAYS = 14;

export type NotificationChannel = 'dates' | 'medication';

/** Wohin das Tippen führt und worauf «Erledigt» oder «Gegeben» wirkt. */
export type NotificationTarget =
  | { kind: 'health'; entryId: string }
  | { kind: 'dose'; medicationId: string; scheduledAt: LocalDateTime };

export type PlannedNotification = {
  /** Deterministisch: «due:<id>:<datum>» oder «dose:<id>:<zeitpunkt>». */
  id: string;
  at: LocalDateTime;
  title: string;
  body: string;
  channel: NotificationChannel;
  target: NotificationTarget;
};

/** Ein offener Termin, so wie ihn die Datenbank liefert. */
export type DueInput = {
  id: string;
  dogName: string;
  title: string;
  nextDueDate: LocalDate;
  /** Eigener Vorlauf; ohne Angabe gilt der aus den Einstellungen. */
  leadDays?: number | null;
};

export type MedicationInput = {
  id: string;
  dogName: string;
  name: string;
  dose: string;
  /** Minuten seit Mitternacht, etwa [480, 1080]. */
  times: number[];
  startDate: LocalDate;
  endDate: LocalDate | null;
  active: boolean;
  /** Zeitpunkte, die schon als gegeben eingetragen sind. */
  given: LocalDateTime[];
};

export type PlanInput = {
  /** Jetzt, als Zeitpunkt in Ortszeit: Früheres wird nicht geplant. */
  now: LocalDateTime;
  reminderMinute: number;
  defaultLeadDays: number;
  dueEntries: DueInput[];
  medications: MedicationInput[];
};

export type PlanTexts = {
  dueTitle: (dogName: string) => string;
  dueBody: (title: string, dueDate: LocalDate) => string;
  doseTitle: (dogName: string) => string;
  doseBody: (name: string, dose: string) => string;
};

function duePlans(input: PlanInput, texts: PlanTexts): PlannedNotification[] {
  const today = input.now.slice(0, 10);
  return input.dueEntries.flatMap((entry) => {
    const leadDays = entry.leadDays ?? input.defaultLeadDays;
    return reminderDays(entry.nextDueDate, leadDays, today).map((day) => ({
      id: `due:${entry.id}:${day}`,
      at: atMinute(day, input.reminderMinute),
      title: texts.dueTitle(entry.dogName),
      body: texts.dueBody(entry.title, entry.nextDueDate),
      channel: 'dates' as const,
      target: { kind: 'health' as const, entryId: entry.id },
    }));
  });
}

function dosePlans(input: PlanInput, texts: PlanTexts): PlannedNotification[] {
  const today = input.now.slice(0, 10);
  const horizon = addDays(today, MEDICATION_HORIZON_DAYS);
  return input.medications
    .filter((medication) => medication.active)
    .flatMap((medication) => {
      const given = new Set(medication.given);
      const last =
        medication.endDate && medication.endDate < horizon ? medication.endDate : horizon;
      const plans: PlannedNotification[] = [];
      for (let day = medication.startDate > today ? medication.startDate : today; day <= last;) {
        for (const time of [...medication.times].sort((a, b) => a - b)) {
          const at = atMinute(day, time);
          if (given.has(at)) continue;
          plans.push({
            id: `dose:${medication.id}:${at}`,
            at,
            title: texts.doseTitle(medication.dogName),
            body: texts.doseBody(medication.name, medication.dose),
            channel: 'medication',
            target: { kind: 'dose', medicationId: medication.id, scheduledAt: at },
          });
        }
        day = addDays(day, 1);
      }
      return plans;
    });
}

/**
 * Was geplant sein soll: die nächsten Benachrichtigungen ab jetzt, die
 * frühesten zuerst, höchstens `MAX_SCHEDULED`. Vergangenes fällt weg –
 * Überfälliges steht in der Übersicht, es erinnert nicht täglich.
 */
export function planNotifications(input: PlanInput, texts: PlanTexts): PlannedNotification[] {
  return [...duePlans(input, texts), ...dosePlans(input, texts)]
    .filter((plan) => plan.at > input.now)
    .sort((a, b) => (a.at === b.at ? a.id.localeCompare(b.id) : a.at.localeCompare(b.at)))
    .slice(0, MAX_SCHEDULED);
}

/** Was das System heute geplant hat. */
export type ScheduledNotification = { id: string; at: LocalDateTime };

export type Reconciliation = {
  /** Kennungen, die verschwinden müssen. */
  cancel: string[];
  /** Benachrichtigungen, die neu zu planen sind. */
  schedule: PlannedNotification[];
};

/**
 * Der Abgleich: Gleiche Kennung und gleiche Zeit bleiben stehen. Alles andere
 * wird gelöscht und neu geplant. Zweimal hintereinander ausgeführt ändert er
 * nichts mehr.
 */
export function reconcile(
  planned: PlannedNotification[],
  scheduled: ScheduledNotification[],
): Reconciliation {
  const times = new Map(scheduled.map((entry) => [entry.id, entry.at]));
  const wanted = new Map(planned.map((plan) => [plan.id, plan]));
  return {
    cancel: scheduled
      .filter((entry) => wanted.get(entry.id)?.at !== entry.at)
      .map((entry) => entry.id),
    schedule: planned.filter((plan) => times.get(plan.id) !== plan.at),
  };
}
