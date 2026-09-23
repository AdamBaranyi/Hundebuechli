import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import { getSettings, updateSettings } from '@/db/repositories/settings';
import type { SettingsPatch } from '@/domain/settings';

export function useSettings() {
  const db = useDb();
  return useQuery({ queryKey: queryKeys.settings, queryFn: () => getSettings(db) });
}

/** Ändert eine Einstellung; der Abgleich der Erinnerungen folgt von selbst. */
export function useSaveSettings() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (patch: SettingsPatch) => updateSettings(db, patch),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.settings }),
  });
}
