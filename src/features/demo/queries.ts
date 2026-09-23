import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { loadDemoData, removeDemoData } from '@/demo/demo-data';
import { loadDemoPhotos } from '@/demo/demo-photos';
import { toLocalDate } from '@/domain/local-date';
import { photoStore } from '@/files/photo-store';

export function useLoadDemo() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      loadDemoData(db, toLocalDate(new Date()), await loadDemoPhotos(photoStore));
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
