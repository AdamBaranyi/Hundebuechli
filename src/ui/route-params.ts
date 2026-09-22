import { z } from '@/domain/zod';

/**
 * Parameter aus Routen und Deep Links sind fremde Daten. Erlaubt ist nur eine
 * UUID; alles andere gilt als «nicht gefunden». Ein Link navigiert nur, er
 * ändert nie etwas.
 */
export function uuidParam(value: unknown): string | null {
  const parsed = z.uuid().safeParse(Array.isArray(value) ? value[0] : value);
  return parsed.success ? parsed.data : null;
}
