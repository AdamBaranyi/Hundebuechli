/// <reference types="node" />
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { addEntry, createDog, start } from './flows';
import { keyboardProblems, observe } from './helpers';
import { expectScreenQuality } from './quality';

const FIXTURES = join(__dirname, '..', 'src', 'domain', '__fixtures__');

test('Ersten Hund anlegen: das Formular prüft, sichert und öffnet das Profil', async ({
  page,
  baseURL,
  browserName,
}) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await page.getByRole('button', { name: 'Ersten Hund anlegen' }).click();
  await expect(page.getByRole('heading', { name: 'Neuer Hund' })).toBeVisible();
  await expectScreenQuality(page, seen, 'Formular Hund');
  expect(await keyboardProblems(page), 'Formular per Tastatur').toEqual([]);

  await page.getByRole('button', { name: 'Sichern' }).click();
  // Der Satz steht unter dem Feld und zusätzlich im Live-Bereich für Screenreader.
  await expect(page.getByRole('alert').getByText('Gib deinem Hund einen Namen.')).toBeVisible();

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Bäri');
  await page.getByRole('textbox', { name: 'Rasse oder Mischung' }).fill('Whippet');
  await page.getByRole('radio', { name: 'Rüde' }).click();
  await page.getByRole('textbox', { name: 'Chipnummer' }).fill('756 0981 2345 6789');
  await expect(page.getByText('Chipnummer aus der Schweiz')).toBeVisible();
  await page.getByRole('button', { name: 'Sichern' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Bäri' })).toBeVisible();
  await expect(page.getByText('Whippet, Rüde')).toBeVisible();
  const copy = page.getByRole('button', { name: /Chipnummer kopieren, 756 0981 2345 6789/ });
  await expect(copy).toBeVisible();

  // Kopieren verändert sonst nichts auf dem Bildschirm: Die Meldung ist der Beleg.
  // Sie steht im ausgeblendeten Bereich; der Live-Bereich trägt denselben Satz.
  const copied = page.locator('[aria-hidden="true"]').getByText('Chipnummer kopiert.');
  await copy.click();
  await expect(copied).toBeVisible();
  // Die Zwischenablage zurücklesen erlaubt Playwright nur in Chromium.
  if (browserName === 'chromium') {
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('756098123456789');
  }
  await expect(copied).toBeHidden({ timeout: 5000 });
  await expect(page.getByRole('navigation', { name: 'Hauptbereiche' })).toBeVisible();
  await expectScreenQuality(page, seen, 'Profil');
});

test('Foto wählen: gespeichert wird es ohne Standortdaten', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Mila' });
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Foto wählen' }).click();
  await (await chooser).setFiles(join(FIXTURES, 'mit-gps.jpg'));
  // react-native-web beschriftet das Bild doppelt: Rahmen und <img>.
  const photo = page.getByRole('img', { name: 'Foto von Mila' }).first();
  await expect(photo).toBeVisible();
  await expect(page.getByRole('button', { name: 'Foto ersetzen' })).toBeVisible();

  // Was gespeichert wurde, steckt im Bild selbst: ein JPEG ohne EXIF.
  const source = await photo.evaluate((node) => {
    const image = node instanceof HTMLImageElement ? node : node.querySelector('img');
    if (image) return image.src;
    return getComputedStyle(node).backgroundImage.replace(/^url\("?|"?\)$/g, '');
  });
  expect(source.startsWith('data:image/jpeg;base64,')).toBe(true);
  const stored = Buffer.from(source.split(',')[1] ?? '', 'base64');
  expect([...stored.subarray(0, 2)]).toEqual([0xff, 0xd8]);
  expect(stored.includes('Exif')).toBe(false);
  expect(stored.includes('http://ns.adobe.com/xap/1.0/')).toBe(false);
  expect(seen.errors).toEqual([]);
});

test('Hunde: Liste, Archiv und Löschen mit Rückfrage', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri', breed: 'Whippet' });
  await addEntry(page, { kind: 'Entwurmung', product: 'Milbemax', due: '3 Monate' });
  await createDog(page, { name: 'Mila', breed: 'Galga' });

  await page.getByRole('link', { name: 'Hunde', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Hunde' })).toBeVisible();
  await expectScreenQuality(page, seen, 'Hunde');

  await page.getByRole('button', { name: /^Mila/ }).click();
  await page.getByRole('button', { name: 'Archivieren' }).click();
  await expect(
    page.getByText('Archiviert: Erinnerungen enden, die Einträge bleiben lesbar.'),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Hunde', exact: true }).click();
  await page.getByRole('button', { name: /^Bäri/ }).click();
  await page.getByRole('button', { name: 'Löschen' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Bäri löschen?' });
  await expect(dialog).toContainText(
    'Das entfernt 1 Eintrag, 0 Fotos und alle Erinnerungen für Bäri.',
  );
  await dialog.getByRole('button', { name: 'Bäri und alle Daten löschen' }).click();

  await page.getByRole('link', { name: 'Hunde', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Bäri/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Archiviert' })).toBeVisible();
});
