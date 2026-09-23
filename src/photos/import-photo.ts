import type { StoredImage } from '@/db/repositories/attachments';
import { base64ToBytes } from '@/domain/base64';
import { isSafeToStore, stripMetadata } from '@/domain/jpeg-metadata';
import type { PhotoStore } from '@/files/types';

/** Das Bild, wie es aus der Auswahl oder der Kamera kommt. */
export type PickedImage = { uri: string; width: number; height: number };

export type ReencodedImage = { base64: string; width: number; height: number };

export type PhotoDeps = {
  /** Kodiert neu als JPEG und dreht das Bild dabei richtig. */
  reencode: (uri: string, resize: ResizeTarget | null) => Promise<ReencodedImage>;
  sha256: (bytes: Uint8Array) => Promise<string>;
  store: Pick<PhotoStore, 'save'>;
};

export type ResizeTarget = { width: number; height: null } | { width: null; height: number };

/** Das Foto trägt auch nach dem Säubern noch Metadaten; es wird nicht gespeichert. */
export class UnsafePhotoError extends Error {
  constructor() {
    super('Foto mit Metadaten verworfen');
    this.name = 'UnsafePhotoError';
  }
}

/** Längste Seite höchstens `maxSide`; kleinere Bilder werden nicht vergrössert. */
export function resizeTarget(image: PickedImage, maxSide: number): ResizeTarget | null {
  const longest = Math.max(image.width, image.height);
  if (longest <= maxSide || longest === 0) return null;
  return image.width >= image.height
    ? { width: maxSide, height: null }
    : { width: null, height: maxSide };
}

/**
 * Jedes Foto: verkleinern und neu kodieren, die Metadaten herausschneiden,
 * dann auf EXIF, XMP und IPTC prüfen, dann Prüfsumme und Ablage. Fast jedes
 * Foto vom iPhone trägt einen Standort; darum wird gesäubert statt abgelehnt.
 * Bleibt danach wider Erwarten etwas übrig, wird nichts gespeichert – lieber
 * kein Foto als eines mit Standort.
 */
export async function importPhoto(
  image: PickedImage,
  deps: PhotoDeps,
  maxSide = 1200,
): Promise<StoredImage> {
  const encoded = await deps.reencode(image.uri, resizeTarget(image, maxSide));
  const bytes = stripMetadata(base64ToBytes(encoded.base64));
  if (!isSafeToStore(bytes)) throw new UnsafePhotoError();
  const sha256 = await deps.sha256(bytes);
  const path = await deps.store.save(bytes);
  return { path, sha256, width: encoded.width, height: encoded.height };
}
