import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import { clearOwner, getOwner, saveOwner } from '@/db/repositories/owner';
import type { OwnerInput } from '@/domain/owner';

export function useOwner() {
  const db = useDb();
  return useQuery({ queryKey: queryKeys.owner, queryFn: () => getOwner(db) });
}

/** Sichert die Halterangaben; ein leerer Name entfernt sie ganz. */
export function useSaveOwner() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: OwnerInput | null) => {
      if (input === null) {
        clearOwner(db);
        return null;
      }
      return saveOwner(db, input);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.owner }),
  });
}
