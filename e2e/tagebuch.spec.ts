/// <reference types="node" />
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { createDog, start } from './flows';
import { observe } from './helpers';
import { expectScreenQuality } from './quality';

const FIXTURES = join(__dirname, '..', 'src', 'domain', '__fixtures__');

test('Tagebuch: Eintrag mit Foto ohne Standortdaten', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });

  await page.getByRole('button', { name: /^Tagebuch/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tagebuch' })).toBeVisible();
  await expect(page.getByText('Noch nichts notiert.')).toBeVisible();

  await page.getByRole('button', { name: 'Eintrag schreiben' }).click();
  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByText('Wähle, worum es geht.')).toBeVisible();

  await page.getByRole('radio', { name: 'Appetit' }).click();
  await page.getByRole('textbox', { name: 'Notiz' }).fill('Hat nur die Hälfte gefressen.');
  await page.getByRole('textbox', { name: 'Uhrzeit' }).fill('0800');
  await expect(page.getByRole('textbox', { name: 'Uhrzeit' })).toHaveValue('08:00');
  await page.getByRole('button', { name: 'Sichern' }).click();

  await expect(page.getByText('Hat nur die Hälfte gefressen.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Appetit/ })).toContainText('08:00');
  await expectScreenQuality(page, seen, 'Tagebuch');

  // Fotos kommen zum gesicherten Eintrag.
  await page.getByRole('button', { name: /^Appetit/ }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Foto hinzufügen' }).click();
  await (await chooser).setFiles(join(FIXTURES, 'mit-gps.jpg'));
  await expect(page.getByRole('img', { name: 'Foto 1 von 1' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(page.getByRole('button', { name: /^Appetit/ })).toContainText('1 Foto');
  expect(seen.errors).toEqual([]);
});
