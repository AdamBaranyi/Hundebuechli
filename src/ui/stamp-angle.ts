/**
 * Jeder Stempel sitzt leicht schief, je Eintrag fest zwischen −8° und +4°,
 * abgeleitet aus der ID. So sieht die Stempelreihe gestempelt aus, und nichts
 * springt beim erneuten Öffnen.
 */
export function stampAngle(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return -8 + (hash % 13);
}
