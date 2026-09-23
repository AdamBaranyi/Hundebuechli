import { z } from '@/domain/zod';

import { localDateSchema } from './local-date';

export const DOCUMENT_CATEGORIES = [
  'pet_passport',
  'insurance',
  'amicus',
  'pedigree',
  'invoice',
  'other',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const documentInputSchema = z.object({
  dogId: z.uuid({ error: 'required' }),
  category: z.enum(DOCUMENT_CATEGORIES, { error: 'required' }),
  title: z.string().trim().min(1, { error: 'required' }).max(80, { error: 'too_long' }),
  date: localDateSchema.nullish().transform((value) => value ?? null),
});

export type DocumentInput = z.input<typeof documentInputSchema>;
