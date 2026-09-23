/** Ablage der Fotos: auf dem Gerät im Dokumentverzeichnis, im Browser nur im Speicher. */
export type PhotoStore = {
  /** Speichert ein geprüftes JPEG und gibt den Pfad relativ zur Ablage zurück. */
  save: (bytes: Uint8Array) => Promise<string>;
  /** Adresse zum Anzeigen. */
  uri: (path: string) => string;
  /** Löscht eine Datei; fehlt sie, ist das kein Fehler. */
  remove: (path: string) => Promise<void>;
  /** Der Inhalt als Base64 – für PDFs, die unter iOS keine Dateien laden dürfen. */
  readBase64: (path: string) => Promise<string>;
};

/** Nur so sehen Pfade aus, die die App selbst angelegt hat. */
export const PHOTO_PATH = /^photos\/[0-9a-f-]{36}\.jpg$/;

export function assertPhotoPath(path: string): void {
  if (!PHOTO_PATH.test(path)) throw new Error('Unbekannter Dateipfad');
}
