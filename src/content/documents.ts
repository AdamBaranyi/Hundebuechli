import type { DocumentCategory } from '@/domain/document';

export const documentCategories: Record<DocumentCategory, string> = {
  pet_passport: 'Heimtierausweis',
  insurance: 'Versicherung',
  amicus: 'AMICUS',
  pedigree: 'Stammbaum',
  invoice: 'Rechnung',
  other: 'Sonstiges',
};

export const documentsText = {
  title: 'Dokumente',
  add: 'Dokument hinzufügen',
  newTitle: 'Neues Dokument',
  editTitle: 'Dokument',
  notFound: 'Dieses Dokument gibt es nicht mehr.',
  empty: 'Noch keine Dokumente.',
  emptyText: 'Fotografiere Heimtierausweis, Police oder Rechnung – alles bleibt auf diesem Gerät.',
  cancel: 'Abbrechen',
  save: 'Sichern',
  saved: 'Dokument gesichert.',
  remove: 'Dokument löschen',
  removeTitle: 'Dokument löschen?',
  removeText: 'Das Dokument und seine Fotos verschwinden. Es lässt sich nicht rückgängig machen.',
  removed: 'Dokument gelöscht.',
  fields: {
    dog: 'Für',
    category: 'Art',
    title: 'Titel',
    titleHint: 'Zum Beispiel Police 2026',
    date: 'Datum',
    dateHint: 'Leer lassen, wenn es keines gibt.',
  },
  pages: (count: number) => (count === 1 ? '1 Seite' : `${count} Seiten`),
  noPages: 'Noch ohne Foto',
  viewer: {
    close: 'Schliessen',
    zoomHint: 'Mit zwei Fingern vergrössern.',
  },
} as const;
