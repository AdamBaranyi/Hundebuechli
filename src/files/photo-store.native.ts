import { Directory, File, Paths } from 'expo-file-system';

import { newId } from '@/db/time';

import { assertPhotoPath, type PhotoStore } from './types';

const FOLDER = 'photos';

/**
 * Gerät: Fotos als Dateien im Dokumentverzeichnis der App. Gelöscht wird nur,
 * was nach einem selbst angelegten Pfad aussieht – ein veränderter Eintrag in
 * der Datenbank kann so keine fremde Datei treffen.
 */
export const photoStore: PhotoStore = {
  async save(bytes) {
    const folder = new Directory(Paths.document, FOLDER);
    if (!folder.exists) folder.create({ intermediates: true });
    const path = `${FOLDER}/${newId()}.jpg`;
    const file = new File(Paths.document, path);
    file.create();
    file.write(bytes);
    return path;
  },
  uri(path) {
    assertPhotoPath(path);
    return new File(Paths.document, path).uri;
  },
  async remove(path) {
    assertPhotoPath(path);
    const file = new File(Paths.document, path);
    if (file.exists) file.delete();
  },
};
