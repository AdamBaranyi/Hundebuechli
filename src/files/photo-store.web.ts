import { newId } from '@/db/time';
import { bytesToBase64 } from '@/domain/base64';

import { assertPhotoPath, type PhotoStore } from './types';

const images = new Map<string, string>();

/**
 * Web-Vorschau: Fotos nur im Speicher, als data-Adresse. Wie die Datenbank
 * verschwinden sie mit dem Tab; im Browser bleibt nichts zurück.
 */
export const photoStore: PhotoStore = {
  async save(bytes) {
    const path = `photos/${newId()}.jpg`;
    images.set(path, `data:image/jpeg;base64,${bytesToBase64(bytes)}`);
    return path;
  },
  uri(path) {
    assertPhotoPath(path);
    return images.get(path) ?? '';
  },
  async remove(path) {
    assertPhotoPath(path);
    images.delete(path);
  },
};
