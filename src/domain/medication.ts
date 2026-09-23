import { z } from '@/domain/zod';

import { type LocalDate, localDateSchema, minuteOfDaySchema } from './local-date';

/** Vorschläge für die Uhrzeiten; alles andere geht von Hand. */
export const TIME_CHOICES = [420, 480, 720, 1080, 1200] as const;

/** Höchstens so viele Uhrzeiten je Medikament – mehr plant niemand ein. */
export const MAX_TIMES = 6;

export const medicationInputSchema = z
  .object({
    dogId: z.uuid({ error: 'required' }),
    name: z.string().trim().min(1, { error: 'required' }).max(80, { error: 'too_long' }),
    dose: z.string().trim().min(1, { error: 'required' }).max(80, { error: 'too_long' }),
    times: z
      .array(minuteOfDaySchema)
      .min(1, { error: 'required' })
      .max(MAX_TIMES, { error: 'too_many' })
      // Doppelte Uhrzeiten wären zwei Erinnerungen zur selben Minute.
      .transform((times) => [...new Set(times)].sort((a, b) => a - b)),
    startDate: localDateSchema,
    endDate: localDateSchema.nullish().transform((value) => value ?? null),
    active: z.boolean().default(true),
  })
  .refine(
    (medication) => medication.endDate === null || medication.endDate >= medication.startDate,
    {
      error: 'end_before_start',
      path: ['endDate'],
    },
  );

export type MedicationInput = z.input<typeof medicationInputSchema>;
export type MedicationData = z.output<typeof medicationInputSchema>;

/** Läuft das Medikament an diesem Tag? Beendete und ruhende zählen nicht. */
export function runsOn(
  medication: Pick<MedicationData, 'startDate' | 'endDate' | 'active'>,
  date: LocalDate,
): boolean {
  if (!medication.active) return false;
  if (date < medication.startDate) return false;
  return medication.endDate === null || date <= medication.endDate;
}
