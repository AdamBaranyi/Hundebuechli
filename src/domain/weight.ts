import { z } from '@/domain/zod';

import { localDateSchema, type LocalDate } from './local-date';

/*
 * Gewicht liegt in Gramm in der Datenbank; eingegeben und angezeigt wird es in
 * Kilogramm mit einer Nachkommastelle. Die App bewertet nicht – sie sagt, was
 * sich geändert hat, nicht ob das gut ist.
 */

export const weightInputSchema = z.object({
  dogId: z.uuid({ error: 'required' }),
  date: localDateSchema,
  grams: z
    .number()
    .int({ error: 'weight_invalid' })
    .min(100, { error: 'weight_invalid' })
    .max(150000, { error: 'weight_invalid' }),
});

export type WeightInput = z.input<typeof weightInputSchema>;

/** Liest «13,8», «13.8» oder «13» als Kilogramm; gibt Gramm zurück oder null. */
export function parseKilograms(text: string): number | null {
  const match = /^\s*(\d{1,3})(?:[.,](\d{1,3}))?\s*$/.exec(text);
  if (!match) return null;
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? '').padEnd(3, '0'));
  const grams = whole * 1000 + fraction;
  return grams > 0 ? grams : null;
}

export type WeightPoint = { date: LocalDate; grams: number };

/**
 * Die Veränderung zum vorherigen Wert: Betrag in Gramm und Richtung. Ohne
 * Vorgänger gibt es nichts zu vergleichen.
 */
export function changeSincePrevious(
  points: readonly WeightPoint[],
): { grams: number; direction: 'more' | 'less' | 'same'; since: LocalDate } | null {
  const sorted = sortByDate(points);
  const last = sorted.at(-1);
  const previous = sorted.at(-2);
  if (!last || !previous) return null;
  const difference = last.grams - previous.grams;
  return {
    grams: Math.abs(difference),
    direction: difference > 0 ? 'more' : difference < 0 ? 'less' : 'same',
    since: previous.date,
  };
}

export function sortByDate(points: readonly WeightPoint[]): WeightPoint[] {
  return [...points].sort((a, b) => a.date.localeCompare(b.date));
}

export type CurvePoint = { x: number; y: number; point: WeightPoint };

export type Curve = {
  points: CurvePoint[];
  /** Drei Haarlinien: unten, Mitte, oben – mit ihrem Gewicht. */
  gridlines: { y: number; grams: number }[];
};

/**
 * Die Kurve in einem Feld der Grösse `width` × `height`. Ein einzelner Wert
 * steht in der Mitte; sind alle Werte gleich, liegt die Linie waagrecht.
 */
export function buildCurve(
  points: readonly WeightPoint[],
  width: number,
  height: number,
  padding = 12,
): Curve {
  const sorted = sortByDate(points);
  const values = sorted.map((point) => point.grams);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const span = highest - lowest;
  // Ohne Unterschied braucht die Skala trotzdem Höhe, sonst teilt man durch null.
  const min = span === 0 ? lowest - 500 : lowest;
  const max = span === 0 ? highest + 500 : highest;
  const innerWidth = width - 2 * padding;
  const innerHeight = height - 2 * padding;
  const yOf = (grams: number) => padding + innerHeight * (1 - (grams - min) / (max - min));
  return {
    points: sorted.map((point, index) => ({
      x: sorted.length === 1 ? width / 2 : padding + (innerWidth * index) / (sorted.length - 1),
      y: yOf(point.grams),
      point,
    })),
    gridlines: [max, (max + min) / 2, min].map((grams) => ({ y: yOf(grams), grams })),
  };
}
