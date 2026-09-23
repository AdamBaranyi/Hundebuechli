import type { PdfFonts } from './document';

/*
 * Browser: expo-print kann hier kein PDF erzeugen, printToFileAsync druckt nur
 * die aktuelle Seite. Darum öffnet sich die Vorlage in einem eigenen Fenster
 * mit dem Druckdialog; dort lässt sie sich «Als PDF sichern». Die Vorschau
 * sagt das neben dem Knopf.
 */

export async function loadPdfFonts(): Promise<PdfFonts> {
  return null;
}

export async function sharePdf(html: string, fileName: string): Promise<void> {
  const target = window.open('', '_blank');
  if (!target) throw new Error('Das Fenster für den Druck wurde blockiert.');
  target.document.open();
  target.document.write(html);
  target.document.close();
  target.document.title = fileName;
  target.focus();
  target.print();
}
