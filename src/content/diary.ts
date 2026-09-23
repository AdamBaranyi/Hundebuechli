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
  rowTime: (date: string, time: string) => `${date}, ${time}`,
  photoCount: (count: number) => (count === 1 ? '1 Foto' : `${count} Fotos`),
} as const;
