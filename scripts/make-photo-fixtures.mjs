#!/usr/bin/env node
/**
 * Erzeugt die Testbilder für die EXIF-Prüfung, reproduzierbar statt von Hand:
 * ein JPEG aus dem Canvas von Chromium (ohne Metadaten) und daraus zwei mit
 * Standort – eines mit EXIF samt GPS (Luzern, 47.05° N, 8.30° O), eines mit
 * XMP. Die Bilder liegen als Daten in src/domain/__fixtures__/.
 *
 * Aufruf: node scripts/make-photo-fixtures.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

const DIR = join(import.meta.dirname, '..', 'src', 'domain', '__fixtures__');

async function canvasJpeg() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const dataUrl = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 48;
      const context = canvas.getContext('2d');
      context.fillStyle = '#EEF0EC';
      context.fillRect(0, 0, 64, 48);
      context.fillStyle = '#B3223F';
      context.fillRect(16, 12, 32, 24);
      return canvas.toDataURL('image/jpeg', 0.9);
    });
    return Buffer.from(dataUrl.split(',')[1], 'base64');
  } finally {
    await browser.close();
  }
}

/** Ein APP1-Segment: FF E1, Länge (inklusive der zwei Längenbytes), Inhalt. */
function app1(payload) {
  const length = payload.length + 2;
  return Buffer.concat([Buffer.from([0xff, 0xe1, length >> 8, length & 0xff]), payload]);
}

const u16 = (n) => Buffer.from([n >> 8, n & 0xff]);
const u32 = (n) => Buffer.from([n >>> 24, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
const entry = (tag, type, count, value) => Buffer.concat([u16(tag), u16(type), u32(count), value]);
const rationals = (...pairs) => Buffer.concat(pairs.flatMap(([a, b]) => [u32(a), u32(b)]));

/** EXIF in Big Endian: IFD0 mit Verweis auf eine GPS-IFD mit Breite und Länge. */
function exifWithGps() {
  const gpsIfdOffset = 8 + 2 + 12 + 4;
  const dataOffset = gpsIfdOffset + 2 + 4 * 12 + 4;
  const tiff = Buffer.concat([
    Buffer.from('MM'),
    u16(42),
    u32(8),
    u16(1),
    entry(0x8825, 4, 1, u32(gpsIfdOffset)), // GPSInfo
    u32(0),
    u16(4),
    entry(0x0001, 2, 2, Buffer.from('N\0\0\0', 'latin1')), // GPSLatitudeRef
    entry(0x0002, 5, 3, u32(dataOffset)), // GPSLatitude
    entry(0x0003, 2, 2, Buffer.from('E\0\0\0', 'latin1')), // GPSLongitudeRef
    entry(0x0004, 5, 3, u32(dataOffset + 24)), // GPSLongitude
    u32(0),
    rationals([47, 1], [3, 1], [0, 1]),
    rationals([8, 1], [18, 1], [0, 1]),
  ]);
  return app1(Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff]));
}

function xmpWithGps() {
  const packet =
    '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
    '<rdf:Description xmlns:exif="http://ns.adobe.com/exif/1.0/" exif:GPSLatitude="47,3.0N" exif:GPSLongitude="8,18.0E"/>' +
    '</rdf:RDF></x:xmpmeta>';
  return app1(Buffer.from(`http://ns.adobe.com/xap/1.0/\0${packet}`, 'latin1'));
}

/** Setzt ein Segment direkt nach dem Start (FF D8) ein. */
const withSegment = (jpeg, segment) =>
  Buffer.concat([jpeg.subarray(0, 2), segment, jpeg.subarray(2)]);

mkdirSync(DIR, { recursive: true });
const clean = await canvasJpeg();
writeFileSync(join(DIR, 'ohne-exif.jpg'), clean);
writeFileSync(join(DIR, 'mit-gps.jpg'), withSegment(clean, exifWithGps()));
writeFileSync(join(DIR, 'mit-xmp.jpg'), withSegment(clean, xmpWithGps()));
console.log('make-photo-fixtures: ohne-exif.jpg, mit-gps.jpg, mit-xmp.jpg');
