/// <reference types="node" />
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { createDog, start } from './flows';
import { observe } from './helpers';
import { expectScreenQuality } from './quality';

const FIXTURES = join(__dirname, '..', 'src', 'domain', '__fixtures__');

test('Dokument: anlegen, Seite fotografieren, im Vollbild öffnen', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });

  await page.getByRole('button', { name: /^Dokumente/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Dokumente' })).toBeVisible();
  await expect(page.getByText('Noch keine Dokumente.')).toBeVisible();

  await page.getByRole('button', { name: 'Dokument hinzufügen' }).click();
  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByText('Wähle die Art des Dokuments.')).toBeVisible();
  await page.getByRole('radio', { name: 'Versicherung' }).click();
  await page.getByRole('textbox', { name: 'Titel' }).fill('Police 2026');
  await page.getByRole('textbox', { name: 'Datum' }).fill('01012026');
  await expect(page.getByRole('textbox', { name: 'Datum' })).toHaveValue('01.01.2026');
  await page.getByRole('button', { name: 'Sichern' }).click();

  await expect(page.getByRole('heading', { name: 'Versicherung' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Police 2026/ })).toContainText('Noch ohne Foto');
  await expectScreenQuality(page, seen, 'Dokumente');

  await page.getByRole('button', { name: /^Police 2026/ }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Foto hinzufügen' }).click();
  await (await chooser).setFiles(join(FIXTURES, 'ohne-exif.jpg'));
  await page.getByRole('button', { name: 'Foto 1 von 1 gross öffnen' }).click();
  await expect(page.getByRole('button', { name: 'Schliessen' })).toBeVisible();
  await page.getByRole('button', { name: 'Schliessen' }).click();
  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(page.getByRole('button', { name: /^Police 2026/ })).toContainText('1 Seite');
  expect(seen.errors).toEqual([]);
});
