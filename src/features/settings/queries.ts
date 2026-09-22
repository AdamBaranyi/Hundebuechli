import { useQuery } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import { getSettings } from '@/db/repositories/settings';

export function useSettings() {
  const db = useDb();
  return useQuery({ queryKey: queryKeys.settings, queryFn: () => getSettings(db) });
}
