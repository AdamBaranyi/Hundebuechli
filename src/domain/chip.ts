/**
 * Chipnummer nach ISO 11784: 15 Ziffern. Die ersten drei nennen das Land
 * (ISO 3166, numerisch) oder den Hersteller. 756 ist die Schweiz. Eine
 * Prüfziffer gibt es in der Norm nicht, darum prüft die App auch keine.
 */
const CHIP_LENGTH = 15;
const SWITZERLAND = '756';

/** Entfernt Leerzeichen und Bindestriche, wie sie beim Abtippen entstehen. */
export function normalizeChipNumber(input: string): string {
  return input.replace(/[\s-]/g, '');
}

export function isValidChipNumber(value: string): boolean {
  return value.length === CHIP_LENGTH && /^\d+$/.test(value);
}

/** «CH», wenn die Nummer mit 756 beginnt, sonst null – die App rät kein Land. */
export function chipCountryCode(value: string): 'CH' | null {
  return isValidChipNumber(value) && value.startsWith(SWITZERLAND) ? 'CH' : null;
}

/** Lesbar in Gruppen zu 3-4-4-4, wie im Heimtierausweis: «756 0981 2345 6789». */
export function formatChipNumber(value: string): string {
  if (!isValidChipNumber(value)) return value;
  return [value.slice(0, 3), value.slice(3, 7), value.slice(7, 11), value.slice(11)].join(' ');
}
