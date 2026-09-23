import type { DiaryCategory } from '@/domain/diary';

export const diaryCategories: Record<DiaryCategory, string> = {
  appetite: 'Appetit',
  digestion: 'Verdauung',
  skin_coat: 'Haut und Fell',
  activity: 'Bewegung',
  behavior: 'Verhalten',
  other: 'Sonstiges',
};

export const diaryText = {
  title: 'Tagebuch',
  add: 'Eintrag schreiben',
  newTitle: 'Neuer Tagebucheintrag',
  editTitle: 'Tagebucheintrag',
  notFound: 'Diesen Eintrag gibt es nicht mehr.',
  empty: 'Noch nichts notiert.',
  emptyText:
    'Was dir auffällt – Appetit, Verdauung, Haut und Fell –, steht hier für die Praxis bereit.',
  cancel: 'Abbrechen',
  save: 'Sichern',
  saved: 'Eintrag gesichert.',
  remove: 'Eintrag löschen',
  removeTitle: 'Tagebucheintrag löschen?',
  removeText: 'Der Eintrag und seine Fotos verschwinden. Es lässt sich nicht rückgängig machen.',
  removed: 'Eintrag gelöscht.',
  fields: {
    dog: 'Für',
    category: 'Worum geht es?',
    date: 'Datum',
    time: 'Uhrzeit',
    text: 'Notiz',
    textHint: 'Was ist dir aufgefallen?',
  },
  photos: {
    title: 'Fotos',
    add: 'Foto hinzufügen',
    take: 'Foto aufnehmen',
    busy: 'Foto wird vorbereitet …',
    label: (index: number, total: number) => `Foto ${index} von ${total}`,
    remove: (index: number) => `Foto ${index} entfernen`,
    removed: 'Foto entfernt.',
    onlyAfterSave: 'Fotos kannst du hinzufügen, sobald der Eintrag gesichert ist.',
    unsafe:
      'Dieses Foto liess sich nicht von seinen Standortdaten befreien und wird darum nicht gespeichert. Versuch es mit einem anderen Foto.',
    failed: 'Das Foto liess sich nicht übernehmen. Versuch es nochmals.',
    denied:
      'Die App darf die Kamera nicht benutzen. Du kannst ein Foto wählen oder die Kamera in den Einstellungen des Geräts erlauben.',
    openSettings: 'Einstellungen öffnen',
  },
  rowTime: (date: string, time: string) => `${date}, ${time}`,
  photoCount: (count: number) => (count === 1 ? '1 Foto' : `${count} Fotos`),
} as const;
