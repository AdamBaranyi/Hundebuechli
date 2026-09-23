import { z } from '@/domain/zod';

import { localDateSchema, minuteOfDaySchema } from './local-date';

export const DIARY_CATEGORIES = [
  'appetite',
  'digestion',
  'skin_coat',
  'activity',
  'behavior',
  'other',
] as const;

export type DiaryCategory = (typeof DIARY_CATEGORIES)[number];

export const diaryInputSchema = z.object({
  dogId: z.uuid({ error: 'required' }),
  date: localDateSchema,
  minute: minuteOfDaySchema,
  category: z.enum(DIARY_CATEGORIES, { error: 'required' }),
  text: z.string().trim().min(1, { error: 'required' }).max(2000, { error: 'too_long' }),
});

export type DiaryInput = z.input<typeof diaryInputSchema>;
