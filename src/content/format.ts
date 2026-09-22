/**
 * Daten und Zahlen nach de-CH: 22.09.2026, 22.9., 13.8 kg, 08:00.
 */
const dayMonth = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'numeric' });
const longDate = new Intl.DateTimeFormat('de-CH', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** «22.9.» – so steht das Datum im Stempel. */
export function formatStampDate(moment: Date): string {
  return dayMonth.format(moment);
}

/** «22. September 2026» – für Sätze und VoiceOver. */
export function formatLongDate(moment: Date): string {
  return longDate.format(moment);
}
