/**
 * Uhrzeit tippen ohne Doppelpunkt: Der Ziffernblock des iPhones hat keinen
 * (Gerätetest 23.09.2026). Das Feld setzt ihn selbst. Beginnt die Eingabe mit
 * 3 bis 9, kann es keine zweistellige Stunde sein: «930» wird «9:30», «1830»
 * wird «18:30». Für «2:00» tippt man «0200».
 */
export function formatTimeInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  const twoDigitHour = Number(digits[0]) <= 2;
  const hours = twoDigitHour ? digits.slice(0, 2) : digits.slice(0, 1);
  const minutes = twoDigitHour ? digits.slice(2, 4) : digits.slice(1, 3);
  return minutes.length > 0 ? `${hours}:${minutes}` : hours;
}
