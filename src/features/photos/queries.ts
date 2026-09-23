import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import {
  addAttachment,
  type AttachmentParent,
  deleteAttachment,
} from '@/db/repositories/attachments';
import { photoStore } from '@/files/photo-store';
import { devicePhotoDeps } from '@/photos/device';
import { importPhoto, type PickedImage } from '@/photos/import-photo';

/** Nach einem Foto: Tagebuch und Dokumente neu laden, dort hängen Bilder. */
function useInvalidatePhotos() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.diary }),
      client.invalidateQueries({ queryKey: queryKeys.documents }),
    ]);
}

/** Ein Foto zu einem gesicherten Eintrag; gespeichert erst nach der Prüfung. */
export function useAddPhoto() {
  const db = useDb();
  const invalidate = useInvalidatePhotos();
  return useMutation({
    mutationFn: async ({ parent, image }: { parent: AttachmentParent; image: PickedImage }) => {
      const stored = await importPhoto(image, devicePhotoDeps);
      return addAttachment(db, parent, stored);
    },
    onSuccess: invalidate,
  });
}

export function useRemovePhoto() {
  const db = useDb();
  const invalidate = useInvalidatePhotos();
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const path = deleteAttachment(db, attachmentId);
      if (path) await photoStore.remove(path);
    },
    onSuccess: invalidate,
  });
}
