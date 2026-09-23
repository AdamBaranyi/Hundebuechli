import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDb } from '@/db/DatabaseProvider';
import { queryKeys } from '@/db/query-keys';
import {
  createMedication,
  deleteMedication,
  type DoseSlot,
  getMedication,
  listDoseSlots,
  listMedications,
  logDose,
  type Medication,
  undoDose,
  updateMedication,
} from '@/db/repositories/medications';
import type { LocalDate } from '@/domain/local-date';
import type { LocalDateTime } from '@/domain/local-time';
import type { MedicationInput } from '@/domain/medication';

export function useMedications(dogId: string) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.medicationsOfDog(dogId),
    queryFn: () => listMedications(db, dogId),
  });
}

export function useMedication(id: string | null) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.medication(id ?? ''),
    enabled: id !== null,
    queryFn: (): Medication | null => (id ? (getMedication(db, id) ?? null) : null),
  });
}

/** Der Fahrplan eines Tages: jede Uhrzeit je laufendem Medikament. */
export function useDoseSlots(date: LocalDate) {
  const db = useDb();
  return useQuery({
    queryKey: queryKeys.doseSlots(date),
    queryFn: (): DoseSlot[] => listDoseSlots(db, date),
  });
}

function useInvalidateMedications() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.medications });
}

export function useSaveMedication() {
  const db = useDb();
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string | null; input: MedicationInput }) =>
      id ? updateMedication(db, id, input) : createMedication(db, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMedication() {
  const db = useDb();
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: async (id: string) => deleteMedication(db, id),
    onSuccess: invalidate,
  });
}

export type DoseStamp = { medicationId: string; scheduledAt: LocalDateTime; at: LocalDateTime };

/**
 * «Gegeben» und das Zurücknehmen. Der Fahrplan wird nicht neu geladen: Die
 * Zeile bleibt an ihrem Platz, bis der Bildschirm neu geöffnet wird.
 */
export function useLogDose() {
  const db = useDb();
  return useMutation({
    mutationFn: async ({ medicationId, scheduledAt, at }: DoseStamp) =>
      logDose(db, medicationId, scheduledAt, at),
  });
}

export function useUndoDose() {
  const db = useDb();
  return useMutation({
    mutationFn: async ({ medicationId, scheduledAt }: Omit<DoseStamp, 'at'>) =>
      undoDose(db, medicationId, scheduledAt),
  });
}
