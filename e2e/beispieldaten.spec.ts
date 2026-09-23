/// <reference types="node" />
import { expect, test } from '@playwright/test';

import { start, TODAY } from './flows';
import { observe, openScreen, storedData, withoutPrintDialog } from './helpers';
import { expectScreenQuality } from './quality';

test('Mit Beispieldaten starten: Bäri und Mila mit einem Jahr Geschichte', async ({
  page,
  baseURL,
}) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await page.getByRole('button', { name: 'Mit Beispieldaten starten' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Als Nächstes' })).toBeVisible();
  // Der Streifen «Beispieldaten» gehört aufs Gerät; die Vorschau sagt es mit ihrem eigenen Hinweis.
  await expect(page.getByText('Beispieldaten', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Überfällig' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Heute' })).toBeVisible();
  await expect(page.getByText('Apoquel 16 mg').first()).toBeVisible();
  await expectScreenQuality(page, seen, 'Als Nächstes mit Beispieldaten');

  await page.getByRole('link', { name: 'Hunde', exact: true }).click();
  await page.getByRole('button', { name: /^Bäri/ }).click();
  await expect(page.getByRole('img', { name: 'Foto von Bäri' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Das Jahr in Stempeln' })).toBeVisible();
  await expectScreenQuality(page, seen, 'Profil mit Beispieldaten');

  // Das Plakat mit dem mitgelieferten Foto: im Browser liest ein Canvas es aus.
  await page.getByRole('button', { name: /^Vermisst-Plakat/ }).click();
  await page.getByRole('textbox', { name: 'Wo zuletzt gesehen?' }).fill('Beispielhausen');
  await page.getByRole('textbox', { name: 'Telefonnummer auf dem Plakat' }).fill('000 000 00 00');
  await withoutPrintDialog(page);
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'PDF erstellen und teilen' }).click();
  const poster = await popup;
  const source = await poster.locator('img.poster-photo').getAttribute('src');
  expect(source?.startsWith('data:image/jpeg;base64,')).toBe(true);
  await poster.close();
  await page.getByRole('button', { name: 'Schliessen' }).click();

  await page.getByRole('link', { name: 'Einstellungen' }).click();
  await page.getByRole('button', { name: 'Beispieldaten entfernen' }).click();
  await expect(page.getByRole('button', { name: 'Ersten Hund anlegen' })).toBeVisible();
  expect(seen.errors).toEqual([]);
});

test('Die Vorschau startet mit Bäri und Mila und speichert nichts', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await page.clock.setFixedTime(TODAY);
  await openScreen(page, '/', { demo: true });

  await expect(page.getByRole('heading', { level: 1, name: 'Als Nächstes' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Bäri' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Mila' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Überfällig' })).toBeVisible();
  await expect(
    page.getByText('Vorschau im Browser. Die App läuft auf iPhone und Android ohne Netz'),
  ).toBeVisible();
  await expectScreenQuality(page, seen, 'Vorschau mit Beispieldaten');
  expect(await storedData(page)).toEqual({
    localStorage: 0,
    sessionStorage: 0,
    cookies: '',
    indexedDb: [],
  });
});
