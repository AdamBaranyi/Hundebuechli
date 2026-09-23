export const photosText = {
  title: 'Fotos',
  add: 'Foto hinzufügen',
  take: 'Foto aufnehmen',
  busy: 'Foto wird vorbereitet …',
  label: (index: number, total: number) => `Foto ${index} von ${total}`,
  open: (index: number, total: number) => `Foto ${index} von ${total} gross öffnen`,
  remove: (index: number) => `Foto ${index} entfernen`,
  removed: 'Foto entfernt.',
  onlyAfterSave: 'Fotos kannst du hinzufügen, sobald der Eintrag gesichert ist.',
  unsafe:
    'Dieses Foto liess sich nicht von seinen Standortdaten befreien und wird darum nicht gespeichert. Versuch es mit einem anderen Foto.',
  failed: 'Das Foto liess sich nicht übernehmen. Versuch es nochmals.',
  denied:
    'Die App darf die Kamera nicht benutzen. Du kannst ein Foto wählen oder die Kamera in den Einstellungen des Geräts erlauben.',
  openSettings: 'Einstellungen öffnen',
} as const;
