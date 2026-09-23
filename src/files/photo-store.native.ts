import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';

import { newId } from '@/db/time';
import { isSafeToStore } from '@/domain/jpeg-metadata';

import { assertPhotoPath, type PhotoStore } from './types';

const FOLDER = 'photos';

/**
 * Gerät: Fotos als Dateien im Dokumentverzeichnis der App. Gelöscht wird nur,
 * was nach einem selbst angelegten Pfad aussieht – ein veränderter Eintrag in
 * der Datenbank kann so keine fremde Datei treffen.
 */
export const photoStore: PhotoStore = {
  async saveBundled(module) {
    const [asset] = await Asset.loadAsync(module);
    if (!asset?.localUri) throw new Error('Foto aus dem Paket nicht gefunden');
    const bytes = await new File(asset.localUri).bytes();
    // Auch mitgelieferte Fotos gehen durch dieselbe Prüfung.
    if (!isSafeToStore(bytes)) throw new Error('Mitgeliefertes Foto trägt Metadaten');
    return this.save(bytes);
  },
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
  async readBase64(path) {
    assertPhotoPath(path);
    return new File(Paths.document, path).base64();
  },
};
