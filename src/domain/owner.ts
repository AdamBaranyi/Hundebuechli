import { z } from '@/domain/zod';

/**
 * Halterangaben. Sie erscheinen nur auf dem Hundesitter-Blatt und dem
 * Vermisst-Plakat, und nur, wenn sie eingetragen sind.
 */
export const ownerInputSchema = z.object({
  name: z.string().trim().min(1, { error: 'required' }).max(80, { error: 'too_long' }),
  phone: z
    .string()
    .trim()
    .max(40, { error: 'too_long' })
    .nullish()
    .transform((value) => (value ? value : null)),
  email: z
    .union([z.literal(''), z.email({ error: 'email_invalid' })])
    .nullish()
    .transform((value) => (value ? value : null)),
  address: z
    .string()
    .trim()
    .max(200, { error: 'too_long' })
    .nullish()
    .transform((value) => (value ? value : null)),
});

export type OwnerInput = z.input<typeof ownerInputSchema>;
