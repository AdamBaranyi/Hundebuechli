import type { HealthKind } from '@/domain/health';

export const healthKinds: Record<HealthKind, string> = {
  vaccination: 'Impfung',
  deworming: 'Entwurmung',
  parasite_protection: 'Zecken- und Flohschutz',
  vet_visit: 'Tierarztbesuch',
};

export const healthText = {
  newTitle: 'Neuer Eintrag',
  editTitle: 'Eintrag bearbeiten',
  notFound: 'Diesen Eintrag gibt es nicht mehr.',
  listTitle: 'Gesundheit',
  empty: 'Noch keine Einträge. Trag ein, was im Büechli steht.',
  cancel: 'Abbrechen',
  save: 'Sichern',
  saved: 'Eintrag gesichert.',
  remove: 'Eintrag löschen',
  removed: 'Eintrag gelöscht.',
  removeTitle: 'Eintrag löschen?',
  removeText: 'Der Eintrag und seine Fotos verschwinden. Es lässt sich nicht rückgängig machen.',
  fields: {
    dog: 'Für',
    kind: 'Art',
    date: 'Datum',
    otherDate: 'Anderes Datum',
    product: 'Bezeichnung oder Produkt',
    recent: 'Zuletzt verwendet',
    nextDue: 'Nächste Fälligkeit',
    nextDueDate: 'Datum der nächsten Fälligkeit',
    note: 'Notiz',
    notePlaceholder: 'Zum Beispiel: mit dem Futter gegeben',
  },
  dateChoices: { today: 'Heute', yesterday: 'Gestern', other: 'Anderes Datum' },
  dueChoices: {
    none: 'Keine',
    months: (months: number) => (months === 1 ? '1 Monat' : `${months} Monate`),
    date: 'Datum wählen',
  },
  nextDueResult: (date: string) => `Nächste Fälligkeit: ${date}`,
  rowDetails: (date: string, product: string | null) => (product ? `${date}, ${product}` : date),
  rowNext: (date: string) => `Nächste Fälligkeit am ${date}`,
  rowDone: 'Erledigt, der nächste Eintrag folgt',
  noNextDue: 'Keine nächste Fälligkeit.',
} as const;
