/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { inspectJpeg, isSafeToStore } from '../jpeg-metadata';

// Erzeugt mit scripts/make-photo-fixtures.mjs; GPS mit ImageIO von Apple gegengeprüft.
const fixture = (name: string) =>
  new Uint8Array(readFileSync(join(__dirname, '..', '__fixtures__', name)));

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

  it('findet EXIF auch hinter Füllbytes', () => {
    const clean = fixture('ohne-exif.jpg');
    const gps = fixture('mit-gps.jpg');
    const segmentLength = 2 + (((gps[4] ?? 0) << 8) | (gps[5] ?? 0));
    const exif = gps.subarray(2, 2 + segmentLength);
    const withFill = new Uint8Array([...clean.subarray(0, 2), 0xff, ...exif, ...clean.subarray(2)]);
    expect(inspectJpeg(withFill)).toEqual({ isJpeg: true, metadata: ['exif'], malformed: false });
  });
});
