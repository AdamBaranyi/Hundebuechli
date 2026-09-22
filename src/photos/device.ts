import { CryptoDigestAlgorithm, digest } from 'expo-crypto';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { photoStore } from '@/files/photo-store';

import type { PhotoDeps, ReencodedImage, ResizeTarget } from './import-photo';

/** Neu kodieren mit expo-image-manipulator; auf dem Gerät und im Browser gleich. */
async function reencodeJpeg(uri: string, resize: ResizeTarget | null): Promise<ReencodedImage> {
  const context = ImageManipulator.manipulate(uri);
  if (resize) context.resize(resize);
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.82, base64: true });
  if (!saved.base64) throw new Error('Neu kodiertes Foto ohne Inhalt');
  return { base64: saved.base64, width: saved.width, height: saved.height };
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  // Kopie mit eigenem ArrayBuffer: digest nimmt keinen SharedArrayBuffer.
  const hash = new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, new Uint8Array(bytes)));
  return [...hash].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const devicePhotoDeps: PhotoDeps = {
  reencode: reencodeJpeg,
  sha256: sha256Hex,
  store: photoStore,
};
