import { z } from '@/domain/zod';

import { isValidChipNumber, normalizeChipNumber } from './chip';
import { localDateSchema } from './local-date';

/*
 * Was ein gültiger Hund ist. Die Fehler tragen Kürzel statt Sätzen; die
 * Oberfläche übersetzt sie mit den Texten aus src/content.
 */

/** Freitext, der auch leer bleiben darf: getrimmt, leer wird null. */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, { error: 'too_long' })
    .nullish()
    .transform((value) => (value ? value : null));
}

const chipNumberSchema = z
  .string()
  .nullish()
  .transform((value) => (value ? normalizeChipNumber(value) : null))
  .refine((value) => value === null || value === '' || isValidChipNumber(value), {
    error: 'chip_invalid',
  })
  .transform((value) => (value ? value : null));

export const dogInputSchema = z.object({
  name: z.string().trim().min(1, { error: 'required' }).max(60, { error: 'too_long' }),
  birthDate: localDateSchema.nullish().transform((value) => value ?? null),
  birthYear: z
    .number()
    .int()
    .min(1980, { error: 'year_invalid' })
    .max(2100, { error: 'year_invalid' })
    .nullish()
    .transform((value) => value ?? null),
  breed: optionalText(80),
  sex: z
    .enum(['male', 'female'])
    .nullish()
    .transform((value) => value ?? null),
  neutered: z.boolean().default(false),
  colorMarkings: optionalText(200),
  chipNumber: chipNumberSchema,
  amicusRegistered: z.boolean().default(false),
  insuranceName: optionalText(80),
  insurancePolicy: optionalText(60),
  insurancePhone: optionalText(40),
  vetName: optionalText(80),
  vetPhone: optionalText(40),
  vetAddress: optionalText(200),
  food: optionalText(500),
  allergies: optionalText(500),
  careNotes: optionalText(1000),
});

export type DogInput = z.input<typeof dogInputSchema>;
export type DogData = z.output<typeof dogInputSchema>;
