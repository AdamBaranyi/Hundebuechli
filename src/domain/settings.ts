import { z } from '@/domain/zod';

import { minuteOfDaySchema } from './local-date';

/** Vorgaben, solange niemand etwas eingestellt hat: 08:00, sieben Tage vorher. */
export const DEFAULT_SETTINGS = {
  reminderMinute: 480,
  defaultLeadDays: 7,
  demoLoaded: false,
} as const;

export const settingsPatchSchema = z
  .object({
    reminderMinute: minuteOfDaySchema,
    defaultLeadDays: z.number().int().min(0).max(365),
    demoLoaded: z.boolean(),
  })
  .partial();

export type SettingsPatch = z.input<typeof settingsPatchSchema>;
