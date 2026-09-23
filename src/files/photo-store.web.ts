import { Asset } from 'expo-asset';

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
  async readBase64(path) {
    assertPhotoPath(path);
    const source = images.get(path) ?? '';
    if (source.startsWith('data:')) return source.replace(/^data:image\/jpeg;base64,/, '');
    return source ? jpegBase64Of(source) : '';
  },
  async saveBundled(module) {
    // Mitgelieferte Fotos liegen als Datei neben der Vorschau (gleicher Ursprung).
    const path = `photos/${newId()}.jpg`;
    images.set(path, Asset.fromModule(module).uri);
    return path;
  },
};

/**
 * Ein mitgeliefertes Foto als Base64 fürs PDF, ohne Netzwerkcode: Das Bild
 * lädt wie jedes <img> vom eigenen Ursprung, ein Canvas liest es aus.
 */
function jpegBase64Of(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d')?.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.82).replace(/^data:image\/jpeg;base64,/, ''));
    };
    image.onerror = () => reject(new Error('Foto nicht lesbar'));
    image.src = uri;
  });
}
