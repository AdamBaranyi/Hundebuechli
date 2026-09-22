export const overviewText = {
  title: 'Als Nächstes',
  filterLabel: 'Hunde anzeigen',
  all: 'Alle',
  sections: {
    overdue: 'Überfällig',
    today: 'Heute',
    thisWeek: 'Diese Woche',
    later: 'Später',
  },
  overdue: (days: number) =>
    days === 1 ? 'Seit gestern überfällig' : `Seit ${days} Tagen überfällig`,
  dueToday: 'Heute fällig',
  dueOn: (date: string) => `Fällig am ${date}`,
  doneOn: (date: string) => `Erledigt am ${date}`,
  stamp: (title: string, dog: string) => `${title} für ${dog} als erledigt stempeln`,
  stamped: (title: string, dog: string, date: string) =>
    `${title} für ${dog} erledigt am ${date}. Tippen, um es zurückzunehmen.`,
  announceDone: (title: string, dog: string) => `${title} für ${dog} erledigt.`,
  announceOpen: (title: string, dog: string) => `${title} für ${dog} wieder offen.`,
  nothingDue: 'Nichts fällig.',
  nextUp: (title: string, dog: string, date: string) =>
    `Als Nächstes: ${title} für ${dog} am ${date}.`,
  nothingPlanned: 'Trag ein, was im Büechli steht. Fällige Termine erscheinen dann hier.',
  addEntry: 'Eintrag hinzufügen',
  undoFailed: 'Das lässt sich nicht mehr zurücknehmen; der neue Eintrag wird schon verwendet.',
} as const;
