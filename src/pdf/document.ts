import { colors } from '@/ui/tokens';

import { esc } from './escape';

/** Schrift als Base64, damit das PDF nichts nachladen muss. Ohne sie: Systemschrift. */
export type PdfFonts = { regular: string; bold: string } | null;

/** A4 in Punkt; expo-print nimmt sonst US Letter. */
export const A4 = { width: 595, height: 842 } as const;

const ink = colors.light;

function fontFaces(fonts: PdfFonts): string {
  if (!fonts) return '';
  return `
  @font-face { font-family: 'Atkinson'; font-weight: 400;
    src: url(data:font/ttf;base64,${fonts.regular}) format('truetype'); }
  @font-face { font-family: 'Atkinson'; font-weight: 700;
    src: url(data:font/ttf;base64,${fonts.bold}) format('truetype'); }`;
}

/**
 * Das Gerüst jedes PDFs: A4, Ränder, Schrift eingebettet, nichts unter 12 pt.
 * Tabellenzeilen und Fotos werden nicht über Seiten zerschnitten. Es gibt
 * keine einzige Adresse nach aussen – Bilder und Schrift sind eingebettet.
 * Gestaltet wird nur über Klassen, nie über style-Attribute: Die Web-Vorschau
 * sperrt sie per CSP (`style-src-attr 'none'`), und der Druck dort nutzt
 * dieselbe Vorlage.
 */
export function pdfDocument(parts: {
  title: string;
  body: string;
  footer: string;
  fonts: PdfFonts;
}): string {
  return `<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<title>${esc(parts.title)}</title>
<style>${fontFaces(parts.fonts)}
  @page { size: ${A4.width}pt ${A4.height}pt; margin: 34pt 40pt; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: 'Atkinson', Helvetica, Arial, sans-serif; font-size: 12pt;
    line-height: 1.4; color: ${ink.graphite}; }
  h1 { font-size: 26pt; font-weight: 700; margin: 0 0 2pt; line-height: 1.15; }
  h2 { font-size: 15pt; font-weight: 700; margin: 16pt 0 6pt; padding-bottom: 3pt;
    border-bottom: 1pt solid ${ink.line}; break-after: avoid; }
  p { margin: 0 0 6pt; }
  .meta { color: ${ink.pencil}; }
  .due { color: ${ink.carmine}; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  th { font-size: 12pt; font-weight: 700; color: ${ink.pencil}; text-align: left;
    padding: 3pt 6pt 3pt 0; border-bottom: 1pt solid ${ink.fieldBorder}; }
  td { font-size: 12pt; text-align: left; vertical-align: top; padding: 4pt 6pt 4pt 0;
    border-bottom: 0.5pt solid ${ink.line}; }
  td.number, th.number { text-align: right; font-variant-numeric: tabular-nums; }
  tr, img, figure, .keep { break-inside: avoid; page-break-inside: avoid; }
  dl { display: grid; grid-template-columns: 34% 66%; gap: 3pt 10pt; margin: 0; }
  dt { color: ${ink.pencil}; }
  dd { margin: 0; }
  figure { margin: 0 0 8pt; }
  img { display: block; max-width: 100%; border-radius: 8pt; }
  footer { margin-top: 18pt; padding-top: 6pt; border-top: 1pt solid ${ink.line};
    color: ${ink.pencil}; font-size: 12pt; }
  .head { display: flex; gap: 14pt; align-items: center; margin-bottom: 8pt; }
  .portrait { width: 96pt; height: 96pt; object-fit: cover; }
  .entry { margin-bottom: 10pt; }
  .entry-photo { display: inline-block; width: 160pt; height: 120pt; object-fit: cover;
    margin: 0 6pt 6pt 0; }
  .sitter { font-size: 14pt; }
  .sitter td, .sitter th { font-size: 14pt; }
  .poster { text-align: center; }
  .poster h1 { font-size: 40pt; }
  .poster .shout { font-size: 64pt; margin: 0; }
  .poster-photo { width: 100%; height: 300pt; object-fit: cover; margin: 8pt 0; }
  .poster-line { font-size: 16pt; margin: 0; }
  .poster-chip { font-size: 14pt; margin-top: 6pt; }
  .poster-seen { font-size: 16pt; margin-top: 8pt; }
  .poster-call { font-size: 24pt; margin-top: 8pt; }
  .strips { display: flex; height: 120pt; margin-top: 12pt;
    border-top: 1pt dashed ${ink.fieldBorder}; }
  .strip { flex: 1; padding: 6pt 2pt; border-left: 1pt dashed ${ink.fieldBorder};
    writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; font-size: 12pt; }
</style>
</head>
<body>
${parts.body}
<footer>${esc(parts.footer)}</footer>
</body>
</html>`;
}
