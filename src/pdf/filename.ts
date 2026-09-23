import type { LocalDate } from '@/domain/local-date';

/**
 * Dateiname wie «Bäri-Tierarzt-2026-09-22.pdf». Umlaute bleiben, alles, was
 * in Dateinamen stört (Schrägstriche, Doppelpunkte, Steuerzeichen), fällt weg;
 * Leerzeichen werden zu Bindestrichen.
 */
export function pdfFileName(dogName: string, kind: string, date: LocalDate): string {
  const clean = (part: string) =>
    part
      .normalize('NFC')
      .replace(/[\u0000-\u001f\u007f/\\:*?"<>|]/g, '')
      .replace(/^\.+/, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 40);
  const name = clean(dogName) || 'Hund';
  return `${name}-${clean(kind)}-${date}.pdf`;
}
