/**
 * Prüft ein JPEG auf Metadaten, die einen Standort tragen können: EXIF (mit
 * GPS) und XMP, beide im Segment APP1. Jedes Foto wird beim Import neu
 * kodiert; danach muss diese Prüfung ein sauberes JPEG sehen, sonst wird es
 * nicht gespeichert. Lieber kein Foto als eines mit Standort.
 *
 * Aufbau eines JPEG: FF D8 (Start), dann Segmente aus FF, Kennbyte, zwei Byte
 * Länge und Inhalt, bis die Bilddaten beginnen (FF DA). Metadaten stehen immer
 * davor.
 */

export type JpegInspection = {
  isJpeg: boolean;
  /** Gefundene Metadaten-Segmente. */
  metadata: ('exif' | 'xmp')[];
  /** Segmentlängen passen nicht zur Datei; dann gilt sie als unsicher. */
  malformed: boolean;
};

const APP1 = 0xe1;
const START_OF_SCAN = 0xda;
const END_OF_IMAGE = 0xd9;
const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // «Exif\0\0»
const XMP_HEADER = 'http://ns.adobe.com/xap/1.0/';

function startsWith(bytes: Uint8Array, offset: number, expected: readonly number[]): boolean {
  return expected.every((value, i) => bytes[offset + i] === value);
}

function asciiAt(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

/** Kennbytes ohne Länge: Neustartmarken RST0 bis RST7 und TEM. */
function isStandalone(marker: number): boolean {
  return (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01;
}

export function inspectJpeg(bytes: Uint8Array): JpegInspection {
  const result: JpegInspection = { isJpeg: false, metadata: [], malformed: false };
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return result;
  result.isJpeg = true;

  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return { ...result, malformed: true };
    let marker = bytes[offset + 1] ?? 0;
    while (marker === 0xff) {
      offset += 1; // Füllbytes
      marker = bytes[offset + 1] ?? 0;
    }
    if (marker === START_OF_SCAN || marker === END_OF_IMAGE) return result;
    if (isStandalone(marker)) {
      offset += 2;
      continue;
    }
    const length = ((bytes[offset + 2] ?? 0) << 8) | (bytes[offset + 3] ?? 0);
    if (length < 2 || offset + 2 + length > bytes.length) return { ...result, malformed: true };
    const payload = offset + 4;
    if (marker === APP1 && startsWith(bytes, payload, EXIF_HEADER)) result.metadata.push('exif');
    if (marker === APP1 && asciiAt(bytes, payload, XMP_HEADER.length) === XMP_HEADER) {
      result.metadata.push('xmp');
    }
    offset += 2 + length;
  }
  // Keine Bilddaten gefunden: kein brauchbares JPEG.
  return { ...result, malformed: true };
}

/** Nur ein wohlgeformtes JPEG ohne EXIF und XMP darf gespeichert werden. */
export function isSafeToStore(bytes: Uint8Array): boolean {
  const inspection = inspectJpeg(bytes);
  return inspection.isJpeg && !inspection.malformed && inspection.metadata.length === 0;
}
