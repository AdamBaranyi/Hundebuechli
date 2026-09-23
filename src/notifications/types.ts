import type { PlannedNotification, ScheduledNotification } from '@/domain/notifications';

/** Ob die App Benachrichtigungen schicken darf. */
export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

/**
 * Was der Abgleich vom Gerät braucht. Eine schmale Schnittstelle: Der Plan
 * lässt sich damit gegen eine Attrappe prüfen, und im Browser gibt es eine
 * Fassung, die nichts tut.
 */
export type NotificationPort = {
  /** Kanäle unter Android; auf anderen Plattformen ohne Wirkung. */
  prepare: () => Promise<void>;
  getPermission: () => Promise<PermissionState>;
  /** Fragt nach der Erlaubnis; nur aufrufen, wenn gerade eine Erinnerung entsteht. */
  requestPermission: () => Promise<PermissionState>;
  getScheduled: () => Promise<ScheduledNotification[]>;
  cancel: (ids: string[]) => Promise<void>;
  schedule: (plans: PlannedNotification[]) => Promise<void>;
};
