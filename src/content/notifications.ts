import type { LocalDate } from '@/domain/local-date';

import { formatLocal } from './format';

/** Was auf dem Sperrbildschirm steht – kurz, ohne Ausrufezeichen. */
export const notificationsText = {
  channels: {
    dates: {
      name: 'Termine',
      description: 'Impfung, Entwurmung, Parasitenschutz und Tierarzt.',
    },
    medication: {
      name: 'Medikamente',
      description: 'Zu den Uhrzeiten, die du einträgst.',
    },
  },
  dueTitle: (dogName: string) => `Termin für ${dogName}`,
  dueBody: (title: string, dueDate: LocalDate) =>
    `${title} ist am ${formatLocal.long(dueDate)} fällig.`,
  doseTitle: (dogName: string) => `Medikament für ${dogName}`,
  doseBody: (name: string, dose: string) => `${name}, ${dose}`,
  actions: {
    done: 'Erledigt',
    given: 'Gegeben',
  },
  permission: {
    title: 'Erinnerungen einschalten',
    text: 'Damit meldet sich das iPhone am Tag des Termins und zu den Uhrzeiten der Medikamente. Die App schickt nichts ins Netz.',
    ask: 'Erinnerungen erlauben',
    later: 'Später',
    denied:
      'Erinnerungen sind ausgeschaltet. In der App bleibt alles sichtbar; erlauben kannst du sie in den Einstellungen des Geräts.',
    openSettings: 'Einstellungen öffnen',
    webNotice: 'In der Vorschau im Browser gibt es keine Erinnerungen. Die Termine stehen hier.',
  },
} as const;
