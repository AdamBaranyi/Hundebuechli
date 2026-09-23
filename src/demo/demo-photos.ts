import type { StoredImage } from '@/db/repositories/attachments';
import type { PhotoStore } from '@/files/types';

import type { DemoPhotos } from './demo-data';

const BAERI_PHOTO = require('../../assets/demo/baeri.jpg') as number;
const MILA_PHOTO = require('../../assets/demo/mila.jpg') as number;

/** Ein mitgeliefertes Foto; fehlt es, laden die Beispieldaten ohne Bild. */
async function bundled(
  store: Pick<PhotoStore, 'saveBundled'>,
  module: number,
  size: number,
): Promise<StoredImage | null> {
  try {
    const path = await store.saveBundled(module);
    // Die Prüfsumme dient nur dem Wiedererkennen; bei Beispielbildern genügt ein Name.
    return { path, sha256: 'beispielbild', width: size, height: size };
  } catch {
    return null;
  }
}

/** Die Fotos von Bäri und Mila, abgelegt in der Fotoablage der App. */
export async function loadDemoPhotos(store: Pick<PhotoStore, 'saveBundled'>): Promise<DemoPhotos> {
  return {
    baeri: await bundled(store, BAERI_PHOTO, 960),
    mila: await bundled(store, MILA_PHOTO, 890),
  };
}
