import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import {
  createDocument,
  deleteDocument,
  type DogDocument,
  getDocument,
  listDocuments,
  pagesOf,
  updateDocument,
} from '@/db/repositories/documents';
import type { DocumentInput } from '@/domain/document';
import { photoStore } from '@/files/photo-store';

import type { PhotoView } from '../photos/AttachedPhotos';

export type DocumentView = DogDocument & { pages: PhotoView[] };

const toViews = (pages: { id: string; path: string }[]): PhotoView[] =>
  pages.map((page) => ({ id: page.id, uri: photoStore.uri(page.path) }));

export function useDocuments(dogId: string) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.documentsOfDog(dogId),
    queryFn: (): DocumentView[] =>
      listDocuments(db, dogId).map((row) => ({ ...row, pages: toViews(row.pages) })),
  });
}

export function useDocument(id: string | null) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.document(id ?? ''),
    enabled: id !== null,
    queryFn: (): DocumentView | null => {
      const row = id ? getDocument(db, id) : undefined;
      return row ? { ...row, pages: toViews(pagesOf(db, row.id)) } : null;
    },
  });
}

function useInvalidateDocuments() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.documents });
}

export function useSaveDocument() {
  const db = useDb();
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string | null; input: DocumentInput }) =>
      id ? updateDocument(db, id, input) : createDocument(db, input),
    onSuccess: invalidate,
  });
}

export function useDeleteDocument() {
  const db = useDb();
  const invalidate = useInvalidateDocuments();
  return useMutation({
    mutationFn: async (id: string) => {
      const { attachmentPaths } = deleteDocument(db, id);
      await Promise.all(attachmentPaths.map((path) => photoStore.remove(path)));
    },
    onSuccess: invalidate,
  });
}
