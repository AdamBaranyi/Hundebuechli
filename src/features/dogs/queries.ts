import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import { dogPhoto, replaceDogPhoto } from '@/db/repositories/attachments';
import {
  countDogData,
  countDogs,
  createDog,
  deleteDog,
  type Dog,
  getDog,
  listDogs,
  setDogArchived,
  updateDog,
} from '@/db/repositories/dogs';
import type { DogInput } from '@/domain/dog';
import { photoStore } from '@/files/photo-store';
import { devicePhotoDeps } from '@/photos/device';
import { importPhoto, type PickedImage } from '@/photos/import-photo';

export type DogWithPhoto = Dog & { photoUri: string | null };

function photoUriOf(path: string | undefined): string | null {
  return path ? photoStore.uri(path) : null;
}

export function useDogList(includeArchived = false) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.dogList(includeArchived),
    queryFn: (): DogWithPhoto[] =>
      listDogs(db, { includeArchived }).map((dog) => ({
        ...dog,
        photoUri: photoUriOf(dogPhoto(db, dog.id)?.path),
      })),
  });
}

/** Alle Hunde, auch archivierte: 0 heisst Erststart. */
export function useDogCount() {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.dogCount,
    queryFn: () => countDogs(db, { includeArchived: true }),
  });
}

export function useDog(id: string | null) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.dog(id ?? ''),
    enabled: id !== null,
    queryFn: (): DogWithPhoto | null => {
      const dog = id ? getDog(db, id) : undefined;
      return dog ? { ...dog, photoUri: photoUriOf(dogPhoto(db, dog.id)?.path) } : null;
    },
  });
}

export function useDogData(id: string) {
  const db = useDb();
  return useQuery({ queryKey: queryKeys.dogData(id), queryFn: () => countDogData(db, id) });
}

function useInvalidateDogs() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.dogs }),
      client.invalidateQueries({ queryKey: queryKeys.openDue }),
    ]);
}

export function useSaveDog() {
  const db = useDb();
  const invalidate = useInvalidateDogs();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string | null; input: DogInput }) =>
      id ? updateDog(db, id, input) : createDog(db, input),
    onSuccess: invalidate,
  });
}

export function useSetDogArchived() {
  const db = useDb();
  const invalidate = useInvalidateDogs();
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) =>
      setDogArchived(db, id, archived),
    onSuccess: invalidate,
  });
}

/** Löschen heisst löschen: Zeilen per Kaskade, danach die Dateien der Fotos. */
export function useDeleteDog() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { attachmentPaths } = deleteDog(db, id);
      await Promise.all(attachmentPaths.map((path) => photoStore.remove(path)));
    },
    onSuccess: () => client.invalidateQueries(),
  });
}

/** Neues Profilfoto: prüfen und ablegen, dann das alte samt Datei entfernen. */
export function useSetDogPhoto() {
  const db = useDb();
  const invalidate = useInvalidateDogs();
  return useMutation({
    mutationFn: async ({ dogId, image }: { dogId: string; image: PickedImage }) => {
      const stored = await importPhoto(image, devicePhotoDeps);
      const { removedPaths } = replaceDogPhoto(db, dogId, stored);
      await Promise.all(removedPaths.map((path) => photoStore.remove(path)));
      return stored;
    },
    onSuccess: invalidate,
  });
}
