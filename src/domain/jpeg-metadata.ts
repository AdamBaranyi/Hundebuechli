/**
 * Nimmt einem JPEG die Metadaten, die einen Standort tragen können, und prüft
 * nach: EXIF (mit GPS) und XMP stehen im Segment APP1, IPTC in APP13. Jedes
 * Foto wird beim Import neu kodiert und hier gesäubert; erst dann darf es
 * gespeichert werden. Bleibt wider Erwarten etwas übrig, wird nichts
 * gespeichert – lieber kein Foto als eines mit Standort.
 *
 * Aufbau eines JPEG: FF D8 (Start), dann Segmente aus FF, Kennbyte, zwei Byte
 * Länge und Inhalt, bis die Bilddaten beginnen (FF DA). Metadaten stehen immer
 * davor.
 */

export type JpegInspection = {
  isJpeg: boolean;
  /** Gefundene Metadaten-Segmente. */
  metadata: ('exif' | 'xmp' | 'iptc')[];
  /** Segmentlängen passen nicht zur Datei; dann gilt sie als unsicher. */
  malformed: boolean;
};

const APP1 = 0xe1;
const APP13 = 0xed;
const COMMENT = 0xfe;
const START_OF_SCAN = 0xda;
const END_OF_IMAGE = 0xd9;
const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // «Exif\0\0»
const XMP_HEADER = 'http://ns.adobe.com/xap/1.0/';
const IPTC_HEADER = 'Photoshop 3.0';
/** APP0 trägt JFIF (Auflösung), APP2 das Farbprofil; beide dürfen bleiben. */
const KEEP = new Set([0xe0, 0xe2]);

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
    if (marker === APP13 && asciiAt(bytes, payload, IPTC_HEADER.length) === IPTC_HEADER) {
      result.metadata.push('iptc');
    }
    offset += 2 + length;
  }
  // Keine Bilddaten gefunden: kein brauchbares JPEG.
  return { ...result, malformed: true };
}

/**
 * Gibt dasselbe Bild ohne beschreibende Segmente zurück: alle APPn ausser
 * JFIF und Farbprofil fallen weg, Kommentare ebenso. Die Bilddaten bleiben
 * Byte für Byte gleich; die Drehung steckt nach dem Neukodieren in den
 * Bildpunkten, nicht mehr im EXIF. Ist die Datei kein JPEG oder kaputt, kommt
 * sie unverändert zurück – die Prüfung danach verwirft sie.
 */
export function stripMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const keep: [number, number][] = [[0, 2]];
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return bytes;
    let marker = bytes[offset + 1] ?? 0;
    while (marker === 0xff) {
      offset += 1; // Füllbytes
      marker = bytes[offset + 1] ?? 0;
    }
    if (marker === START_OF_SCAN || marker === END_OF_IMAGE) {
      keep.push([offset, bytes.length]); // Bilddaten bis zum Schluss
      return join(bytes, keep);
    }
    if (isStandalone(marker)) {
      keep.push([offset, offset + 2]);
      offset += 2;
      continue;
    }
    const length = ((bytes[offset + 2] ?? 0) << 8) | (bytes[offset + 3] ?? 0);
    if (length < 2 || offset + 2 + length > bytes.length) return bytes;
    const end = offset + 2 + length;
    const describes = (marker >= 0xe0 && marker <= 0xef && !KEEP.has(marker)) || marker === COMMENT;
    if (!describes) keep.push([offset, end]);
    offset = end;
  }
  return bytes; // keine Bilddaten gefunden
}

function join(bytes: Uint8Array, ranges: readonly [number, number][]): Uint8Array {
  const size = ranges.reduce((total, [from, to]) => total + (to - from), 0);
  const result = new Uint8Array(size);
  let at = 0;
  for (const [from, to] of ranges) {
    result.set(bytes.subarray(from, to), at);
    at += to - from;
  }
  return result;
}

/** Nur ein wohlgeformtes JPEG ohne EXIF, XMP und IPTC darf gespeichert werden. */
export function isSafeToStore(bytes: Uint8Array): boolean {
  const inspection = inspectJpeg(bytes);
  return inspection.isJpeg && !inspection.malformed && inspection.metadata.length === 0;
}
