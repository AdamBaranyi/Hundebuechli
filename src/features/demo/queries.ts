import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import type { StoredImage } from '@/db/repositories/attachments';
import { loadDemoData, removeDemoData } from '@/demo/demo-data';
import { toLocalDate } from '@/domain/local-date';
import { photoStore } from '@/files/photo-store';

const BAERI_PHOTO = require('../../../assets/demo/baeri.jpg') as number;
const MILA_PHOTO = require('../../../assets/demo/mila.jpg') as number;

/** Ein mitgeliefertes Foto; fehlt es, laden die Beispieldaten ohne Bild. */
async function bundled(module: number, size: number): Promise<StoredImage | null> {
  try {
    const path = await photoStore.saveBundled(module);
    // Die Prüfsumme dient nur dem Wiedererkennen; bei Beispielbildern genügt ein Name.
    return { path, sha256: 'beispielbild', width: size, height: size };
  } catch {
    return null;
  }
}

export function useLoadDemo() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const photos = {
        baeri: await bundled(BAERI_PHOTO, 960),
        mila: await bundled(MILA_PHOTO, 890),
      };
      loadDemoData(db, toLocalDate(new Date()), photos);
    },
    onSuccess: () => client.resetQueries(),
  });
}

export function useRemoveDemo() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { attachmentPaths } = removeDemoData(db);
      await Promise.all(attachmentPaths.map((path) => photoStore.remove(path)));
    },
    onSuccess: () => client.resetQueries(),
  });
}
