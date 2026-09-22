import { z } from 'zod';

import { addMonths } from './calendar';
import { type LocalDate, localDateSchema } from './local-date';

export const HEALTH_KINDS = [
  'vaccination',
  'deworming',
  'parasite_protection',
  'vet_visit',
] as const;
export type HealthKind = (typeof HEALTH_KINDS)[number];

/** Schnellwahl für die nächste Fälligkeit. Die App schlägt keine Intervalle vor. */
export const REPEAT_CHOICES = [1, 3, 6, 12, 36] as const;

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, { error: 'too_long' })
    .nullish()
    .transform((value) => (value ? value : null));
}

export const healthEntryInputSchema = z
  .object({
    dogId: z.uuid({ error: 'required' }),
    kind: z.enum(HEALTH_KINDS, { error: 'required' }),
    date: localDateSchema,
    product: optionalText(80),
    note: optionalText(1000),
    nextDueDate: localDateSchema.nullish().transform((value) => value ?? null),
    repeatMonths: z
      .number()
      .int()
      .min(1)
      .max(120)
      .nullish()
      .transform((value) => value ?? null),
  })
  .refine((entry) => entry.nextDueDate === null || entry.nextDueDate > entry.date, {
    error: 'due_before_date',
    path: ['nextDueDate'],
  });

export type HealthEntryInput = z.input<typeof healthEntryInputSchema>;
export type HealthEntryData = z.output<typeof healthEntryInputSchema>;

/** Nächste Fälligkeit aus Datum und Wiederholung, mit festgehaltenem Monatsende. */
export function nextDueFrom(date: LocalDate, repeatMonths: number | null): LocalDate | null {
  return repeatMonths ? addMonths(date, repeatMonths) : null;
}

/**
 * «Erledigt»: ein neuer Eintrag mit heutigem Datum, derselben Art, demselben
 * Produkt und derselben Wiederholung; die nächste Fälligkeit folgt daraus.
 */
export function completionOf(
  entry: Pick<HealthEntryData, 'dogId' | 'kind' | 'product' | 'repeatMonths'>,
  today: LocalDate,
): HealthEntryData {
  return {
    dogId: entry.dogId,
    kind: entry.kind,
    date: today,
    product: entry.product,
    note: null,
    nextDueDate: nextDueFrom(today, entry.repeatMonths),
    repeatMonths: entry.repeatMonths,
  };
}
