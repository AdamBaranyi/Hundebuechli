export const settingsText = {
  title: 'Einstellungen',
  about: 'Hinweis',
  privacy: 'Datenschutz',
  privacyText:
    'Alle Einträge und Fotos bleiben auf diesem Gerät. Die App stellt keine Verbindung ins Internet her und kennt keine Konten.',
  reminders: 'Erinnerungen',
  reminderTime: 'Uhrzeit der Terminerinnerungen',
  reminderTimeHint: 'Zu dieser Zeit meldet sich die App am Tag des Termins.',
  reminderTimeError: 'Schreib die Uhrzeit so: 08:00.',
  lead: 'Wie früh vorher?',
  leadChoices: {
    0: 'Am Tag selbst',
    1: 'Einen Tag vorher',
    3: 'Drei Tage vorher',
    7: 'Eine Woche vorher',
    14: 'Zwei Wochen vorher',
  },
  version: (version: string) => `Version ${version}`,
} as const;
