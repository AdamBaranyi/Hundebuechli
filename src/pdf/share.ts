import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { fontFiles } from '@/ui/tokens';

import { A4, type PdfFonts } from './document';

/*
 * Gerät: Aus dem HTML wird mit expo-print ein PDF, das unter einem lesbaren
 * Namen im Zwischenspeicher liegt und über das Teilen-Blatt des Systems geht –
 * Nachrichten, Mail, «In Dateien sichern». Nichts davon braucht das Netz.
 */

let fonts: PdfFonts | undefined;

async function base64Of(module: number): Promise<string> {
  const [asset] = await Asset.loadAsync(module);
  if (!asset?.localUri) throw new Error('Schrift nicht gefunden');
  return new File(asset.localUri).base64();
}

/** Die Schrift der App fürs PDF; fehlt sie, nimmt das PDF die Systemschrift. */
export async function loadPdfFonts(): Promise<PdfFonts> {
  if (fonts !== undefined) return fonts;
  try {
    fonts = {
      regular: await base64Of(fontFiles['AtkinsonHyperlegibleNext-Regular']),
      bold: await base64Of(fontFiles['AtkinsonHyperlegibleNext-Bold']),
    };
  } catch {
    fonts = null;
  }
  return fonts;
}

export async function sharePdf(html: string, fileName: string): Promise<void> {
  const printed = await Print.printToFileAsync({ html, width: A4.width, height: A4.height });
  const target = new File(Paths.cache, fileName);
  if (target.exists) target.delete();
  await new File(printed.uri).move(target);
  await Sharing.shareAsync(target.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: fileName,
  });
}
