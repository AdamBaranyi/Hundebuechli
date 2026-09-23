import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import { deleteWeight, listWeightRows, saveWeight } from '@/db/repositories/weights';
import type { WeightInput } from '@/domain/weight';

export function useWeights(dogId: string) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.weightsOfDog(dogId),
    queryFn: () => listWeightRows(db, dogId),
  });
}

function useInvalidateWeights() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.weights });
}

export function useSaveWeight() {
  const db = useDb();
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: async (input: WeightInput) => saveWeight(db, input),
    onSuccess: invalidate,
  });
}

export function useDeleteWeight() {
  const db = useDb();
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: async (id: string) => deleteWeight(db, id),
    onSuccess: invalidate,
  });
}
