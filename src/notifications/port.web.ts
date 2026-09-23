import type { NotificationPort } from './types';

/**
 * In der Web-Vorschau gibt es keine Erinnerungen: Sie gehören aufs Gerät, und
 * eine Browser-Benachrichtigung würde nur kommen, solange der Tab offen ist.
 * Die Übersicht zeigt dieselben Termine als Liste, ein Hinweis sagt das.
 */
export const devicePort: NotificationPort = {
  prepare: async () => undefined,
  getPermission: async () => 'unsupported',
  requestPermission: async () => 'unsupported',
  getScheduled: async () => [],
  cancel: async () => undefined,
  schedule: async () => undefined,
  onResponse: () => () => undefined,
  lastResponse: async () => null,
};

export const ACTION_DONE = 'erledigt';
export const CATEGORY_DUE = 'termin';
export const CATEGORY_DOSE = 'medikament';
