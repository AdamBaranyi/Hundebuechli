export const weightsText = {
  title: 'Gewicht',
  add: 'Gewicht eintragen',
  newTitle: 'Neues Gewicht',
  empty: 'Noch nichts gewogen.',
  emptyText: 'Trag ein Gewicht ein, dann zeigt die App die Kurve.',
  cancel: 'Abbrechen',
  save: 'Sichern',
  saved: 'Gewicht gesichert.',
  fields: {
    dog: 'Für',
    date: 'Datum',
    weight: 'Gewicht in Kilogramm',
    weightHint: 'Zum Beispiel 13,8',
  },
  /** Die Anzeige über der Kurve. */
  measuredOn: (date: string) => `Gewogen am ${date}`,
  change: {
    more: (amount: string, since: string) => `${amount} mehr als am ${since}`,
    less: (amount: string, since: string) => `${amount} weniger als am ${since}`,
    same: (_amount: string, since: string) => `Gleich wie am ${since}`,
    first: 'Der erste Wert – ab jetzt zeigt die App die Veränderung.',
  },
  views: { curve: 'Kurve', table: 'Tabelle' },
  chartLabel: (name: string, count: number) =>
    `Gewichtskurve von ${name} mit ${count === 1 ? '1 Wert' : `${count} Werten`}`,
  table: { date: 'Datum', weight: 'Gewicht', difference: 'Veränderung' },
  remove: 'Wiegung löschen',
  removeLabel: (date: string, weight: string) => `Wiegung vom ${date}, ${weight}, löschen`,
  removed: 'Wiegung gelöscht.',
  removeTitle: 'Wiegung löschen?',
  removeText: 'Der Wert verschwindet aus Kurve und Tabelle.',
} as const;
