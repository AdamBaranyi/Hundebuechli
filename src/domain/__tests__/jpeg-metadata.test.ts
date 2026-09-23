/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { inspectJpeg, isSafeToStore, stripMetadata } from '../jpeg-metadata';

// Erzeugt mit scripts/make-photo-fixtures.mjs; GPS mit ImageIO von Apple gegengeprüft.
const fixture = (name: string) =>
  new Uint8Array(readFileSync(join(__dirname, '..', '__fixtures__', name)));

/** Ein Segment mit Kennbyte und Inhalt, wie es vor den Bilddaten stünde. */
function segment(marker: number, content: string): number[] {
  const payload = [...content].map((sign) => sign.charCodeAt(0));
  const length = payload.length + 2;
  return [0xff, marker, length >> 8, length & 0xff, ...payload];
}

/** Die Bilddaten ab FF DA; sie müssen das Säubern unverändert überstehen. */
function scan(bytes: Uint8Array): Uint8Array {
  for (let i = 2; i < bytes.length - 1; i += 1) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xda) return bytes.subarray(i);
  }
  throw new Error('Keine Bilddaten gefunden');
}

describe('EXIF-Prüfung', () => {
  it('lässt ein JPEG ohne Metadaten durch', () => {
    const bytes = fixture('ohne-exif.jpg');
    expect(inspectJpeg(bytes)).toEqual({ isJpeg: true, metadata: [], malformed: false });
    expect(isSafeToStore(bytes)).toBe(true);
  });

  it('verwirft ein Testbild mit GPS im EXIF', () => {
    const bytes = fixture('mit-gps.jpg');
    expect(inspectJpeg(bytes).metadata).toEqual(['exif']);
    expect(isSafeToStore(bytes)).toBe(false);
  });

  it('verwirft ein Testbild mit Standort im XMP', () => {
    const bytes = fixture('mit-xmp.jpg');
    expect(inspectJpeg(bytes).metadata).toEqual(['xmp']);
    expect(isSafeToStore(bytes)).toBe(false);
  });

  it('verwirft alles, was kein JPEG ist', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(inspectJpeg(png).isJpeg).toBe(false);
    expect(isSafeToStore(png)).toBe(false);
    expect(isSafeToStore(new Uint8Array())).toBe(false);
  });

  it('verwirft ein abgeschnittenes JPEG, statt zu raten', () => {
    const bytes = fixture('mit-gps.jpg').subarray(0, 40);
    expect(inspectJpeg(bytes).malformed).toBe(true);
    expect(isSafeToStore(fixture('ohne-exif.jpg').subarray(0, 30))).toBe(false);
  });

  it('findet Standort im IPTC von Photoshop', () => {
    const clean = fixture('ohne-exif.jpg');
    const iptc = segment(0xed, `Photoshop 3.0\0`);
    const bytes = new Uint8Array([...clean.subarray(0, 2), ...iptc, ...clean.subarray(2)]);
    expect(inspectJpeg(bytes).metadata).toEqual(['iptc']);
    expect(isSafeToStore(bytes)).toBe(false);
    expect(isSafeToStore(stripMetadata(bytes))).toBe(true);
  });

  it('findet EXIF auch hinter Füllbytes', () => {
    const clean = fixture('ohne-exif.jpg');
    const gps = fixture('mit-gps.jpg');
    const segmentLength = 2 + (((gps[4] ?? 0) << 8) | (gps[5] ?? 0));
    const exif = gps.subarray(2, 2 + segmentLength);
    const withFill = new Uint8Array([...clean.subarray(0, 2), 0xff, ...exif, ...clean.subarray(2)]);
    expect(inspectJpeg(withFill)).toEqual({ isJpeg: true, metadata: ['exif'], malformed: false });
  });
});

describe('Metadaten herausschneiden', () => {
  it.each(['mit-gps.jpg', 'mit-xmp.jpg'])('säubert %s und lässt die Bilddaten gleich', (name) => {
    const original = fixture(name);
    const cleaned = stripMetadata(original);
    expect(inspectJpeg(cleaned)).toEqual({ isJpeg: true, metadata: [], malformed: false });
    expect(isSafeToStore(cleaned)).toBe(true);
    expect(cleaned.length).toBeLessThan(original.length);
    const data = scan(cleaned);
    expect(Buffer.from(data)).toEqual(
      Buffer.from(original.subarray(original.length - data.length)),
    );
  });

  it('lässt ein sauberes JPEG, wie es ist', () => {
    const clean = fixture('ohne-exif.jpg');
    expect(Buffer.from(stripMetadata(clean))).toEqual(Buffer.from(clean));
  });

  it('behält das Farbprofil und wirft Kommentare weg', () => {
    const clean = fixture('ohne-exif.jpg');
    const profile = segment(0xe2, 'ICC_PROFILE\0Farben');
    const comment = segment(0xfe, 'Aufgenommen in Luzern');
    const bytes = new Uint8Array([
      ...clean.subarray(0, 2),
      ...profile,
      ...comment,
      ...clean.subarray(2),
    ]);
    const cleaned = stripMetadata(bytes);
    expect(cleaned.length).toBe(bytes.length - comment.length);
    expect(Buffer.from(cleaned).includes('Luzern')).toBe(false);
    expect(Buffer.from(cleaned).includes('ICC_PROFILE')).toBe(true);
  });

  it('gibt zurück, was kein JPEG ist, und verlässt sich auf die Prüfung', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    expect(Buffer.from(stripMetadata(png))).toEqual(Buffer.from(png));
    const cut = fixture('mit-gps.jpg').subarray(0, 40);
    expect(isSafeToStore(stripMetadata(cut))).toBe(false);
  });
});
