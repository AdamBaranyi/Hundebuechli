import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import {
  completeHealthEntry,
  createHealthEntry,
  deleteHealthEntry,
  getHealthEntry,
  type HealthEntry,
  listHealthEntries,
  listOpenDue,
  recentProducts,
  undoCompletion,
  updateHealthEntry,
} from '@/db/repositories/health';
import type { HealthEntryInput, HealthKind } from '@/domain/health';
import type { LocalDate } from '@/domain/local-date';
import { photoStore } from '@/files/photo-store';

export function useHealthEntries(dogId: string) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.healthOfDog(dogId),
    queryFn: () => listHealthEntries(db, dogId),
  });
}

export function useHealthEntry(id: string | null) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.healthEntry(id ?? ''),
    enabled: id !== null,
    queryFn: (): HealthEntry | null => (id ? (getHealthEntry(db, id) ?? null) : null),
  });
}

export function useOpenDue() {
  const db = useDb();
  return useQuery({ queryKey: queryKeys.openDue, queryFn: () => listOpenDue(db) });
}

export function useRecentProducts(dogId: string | null, kind: HealthKind | null) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.recentProducts(dogId ?? '', kind ?? ''),
    enabled: dogId !== null && kind !== null,
    queryFn: () => (dogId && kind ? recentProducts(db, dogId, kind) : []),
  });
}

/** Nach Änderungen aus Formularen: alles zu Hunden und Einträgen neu, auch die Übersicht. */
function useInvalidateAll() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.health }),
      client.invalidateQueries({ queryKey: queryKeys.dogs }),
      client.invalidateQueries({ queryKey: queryKeys.openDue }),
    ]);
}

/**
 * Nach «Erledigt» und «Zurücknehmen» in der Übersicht: alles ausser der
 * Übersicht selbst. Die Zeile bleibt an ihrem Platz, bis der Bildschirm neu
 * geöffnet wird.
 */
function useInvalidateBehindOverview() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.health }),
      client.invalidateQueries({ queryKey: queryKeys.dogs }),
    ]);
}

export function useSaveHealthEntry() {
  const db = useDb();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string | null; input: HealthEntryInput }) =>
      id ? updateHealthEntry(db, id, input) : createHealthEntry(db, input),
    onSuccess: invalidate,
  });
}

export function useDeleteHealthEntry() {
  const db = useDb();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      const { attachmentPaths } = deleteHealthEntry(db, id);
      await Promise.all(attachmentPaths.map((path) => photoStore.remove(path)));
    },
    onSuccess: invalidate,
  });
}

export function useCompleteEntry() {
  const db = useDb();
  const invalidate = useInvalidateBehindOverview();
  return useMutation({
    mutationFn: async ({ id, today }: { id: string; today: LocalDate }) =>
      completeHealthEntry(db, id, today),
    onSuccess: invalidate,
  });
}

export function useUndoCompletion() {
  const db = useDb();
  const invalidate = useInvalidateBehindOverview();
  return useMutation({
    mutationFn: async (id: string) => undoCompletion(db, id),
    onSuccess: invalidate,
  });
}
