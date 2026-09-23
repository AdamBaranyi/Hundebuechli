/**
 * Datum tippen ohne Punkt: Der Ziffernblock des iPhones hat keinen. Das Feld
 * setzt die Punkte darum selbst, sobald genug Ziffern da sind – und lässt sie
 * beim Löschen wieder weg, damit die Rücktaste normal wirkt.
 */
export function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter((part) => part.length > 0).join('.');
}
