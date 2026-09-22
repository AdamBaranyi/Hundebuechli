import type { LocalDate } from './local-date';

/**
 * Alter in ganzen Jahren und Monaten aus Geburtsdatum oder Geburtsjahr. Mit
 * nur einem Jahr bleibt es bei Jahren; die App erfindet keinen Monat.
 */
export function ageOf(
  birth: { birthDate: LocalDate | null; birthYear: number | null },
  today: LocalDate,
): { years: number; months: number | null } | null {
  const [year, month, day] = today.split('-').map(Number) as [number, number, number];
  if (birth.birthDate) {
    const [bYear, bMonth, bDay] = birth.birthDate.split('-').map(Number) as [
      number,
      number,
      number,
    ];
    let total = (year - bYear) * 12 + (month - bMonth);
    if (day < bDay) total -= 1;
    if (total < 0) return null;
    return { years: Math.floor(total / 12), months: total % 12 };
  }
  if (birth.birthYear && birth.birthYear <= year) {
    return { years: year - birth.birthYear, months: null };
  }
  return null;
}
