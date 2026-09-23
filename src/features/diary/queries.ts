import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import { addAttachment, deleteAttachment } from '@/db/repositories/attachments';
import {
  createDiaryEntry,
  deleteDiaryEntry,
  type DiaryEntry,
  getDiaryEntry,
  listDiaryEntries,
  photosOf,
  updateDiaryEntry,
} from '@/db/repositories/diary';
import type { DiaryInput } from '@/domain/diary';
import { photoStore } from '@/files/photo-store';
import { devicePhotoDeps } from '@/photos/device';
import { importPhoto, type PickedImage } from '@/photos/import-photo';

/** Ein Eintrag mit Adressen seiner Bilder, wie die Oberfläche sie braucht. */
export type DiaryPhotoView = { id: string; uri: string };
export type DiaryEntryView = DiaryEntry & { photos: DiaryPhotoView[] };

export function useDiaryEntries(dogId: string) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.diaryOfDog(dogId),
    queryFn: (): DiaryEntryView[] =>
      listDiaryEntries(db, dogId).map((entry) => ({
        ...entry,
        photos: entry.photos.map((photo) => ({ id: photo.id, uri: photoStore.uri(photo.path) })),
      })),
  });
}

export function useDiaryEntry(id: string | null) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.diaryEntry(id ?? ''),
    enabled: id !== null,
    queryFn: (): DiaryEntryView | null => {
      if (!id) return null;
      const entry = getDiaryEntry(db, id);
      if (!entry) return null;
      return {
        ...entry,
        photos: photosOf(db, id).map((photo) => ({
          id: photo.id,
          uri: photoStore.uri(photo.path),
        })),
      };
    },
  });
}

function useInvalidateDiary() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.diary });
}

export function useSaveDiaryEntry() {
  const db = useDb();
  const invalidate = useInvalidateDiary();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string | null; input: DiaryInput }) =>
      id ? updateDiaryEntry(db, id, input) : createDiaryEntry(db, input),
    onSuccess: invalidate,
  });
}

export function useDeleteDiaryEntry() {
  const db = useDb();
  const invalidate = useInvalidateDiary();
  return useMutation({
    mutationFn: async (id: string) => {
      const { attachmentPaths } = deleteDiaryEntry(db, id);
      await Promise.all(attachmentPaths.map((path) => photoStore.remove(path)));
    },
    onSuccess: invalidate,
  });
}

/** Ein Foto zu einem gesicherten Eintrag; erst nach der Prüfung gespeichert. */
export function useAddDiaryPhoto() {
  const db = useDb();
  const invalidate = useInvalidateDiary();
  return useMutation({
    mutationFn: async ({ entryId, image }: { entryId: string; image: PickedImage }) => {
      const stored = await importPhoto(image, devicePhotoDeps);
      return addAttachment(db, { diaryEntryId: entryId }, stored);
    },
    onSuccess: invalidate,
  });
}

export function useRemoveDiaryPhoto() {
  const db = useDb();
  const invalidate = useInvalidateDiary();
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const path = deleteAttachment(db, attachmentId);
      if (path) await photoStore.remove(path);
    },
    onSuccess: invalidate,
  });
}
