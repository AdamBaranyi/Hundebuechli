/**
 * Macht aus den zugeschnittenen CC0-Fotos die Beispielbilder der App: ohne
 * Metadaten, geprüft wie jedes andere Foto. Einmal ausgeführt, Ergebnis liegt
 * im Repository (assets/demo/). Aufruf im Projektordner: bun scripts/make-demo-photos.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { inspectJpeg, isSafeToStore, stripMetadata } from '../src/domain/jpeg-metadata';

const folder = join(process.cwd(), 'assets', 'demo');

for (const name of ['baeri', 'mila']) {
  const source = new Uint8Array(readFileSync(join(folder, `${name}-crop.jpg`)));
  const cleaned = stripMetadata(source);
  if (!isSafeToStore(cleaned)) {
    throw new Error(`${name}: ${JSON.stringify(inspectJpeg(cleaned))}`);
  }
  writeFileSync(join(folder, `${name}.jpg`), cleaned);
  console.log(`${name}.jpg: ${cleaned.length} Bytes, ohne Metadaten`);
}
