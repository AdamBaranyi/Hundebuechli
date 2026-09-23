/// <reference types="node" />
import { expect, test } from '@playwright/test';

import { createDog, start } from './flows';
import { observe } from './helpers';
import { expectScreenQuality } from './quality';

test('Vermisst-Plakat: Ort eintragen, die Vorlage öffnet sich zum Drucken', async ({
  page,
  baseURL,
}) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri', breed: 'Whippet', chip: '756 0981 2345 6789' });

  await page.getByRole('button', { name: /^Vermisst-Plakat/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'PDF erstellen' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Vermisst-Plakat' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByText(/Druckdialog/)).toBeVisible();

  await page.getByRole('button', { name: 'PDF erstellen und teilen' }).click();
  await expect(page.getByText('Bitte ausfüllen.').first()).toBeVisible();

  await page.getByRole('textbox', { name: 'Wo zuletzt gesehen?' }).fill('Littau, beim Reussufer');
  await page.getByRole('textbox', { name: 'Telefonnummer auf dem Plakat' }).fill('000 000 00 00');
  await expectScreenQuality(page, seen, 'PDF erstellen');

  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'PDF erstellen und teilen' }).click();
  const poster = await popup;
  await expect(poster.getByText('Vermisst', { exact: true })).toBeVisible();
  await expect(poster.getByRole('heading', { name: 'Bäri' })).toBeVisible();
  await expect(poster.getByText('756 0981 2345 6789')).toBeVisible();
  await expect(poster.getByText(/Littau, beim Reussufer, am 22\. September 2026/)).toBeVisible();
  await expect(poster.getByText('Bäri vermisst')).toHaveCount(8);
  expect(seen.errors).toEqual([]);
});

test('Tierarzt-PDF: feindselige Eingaben bleiben Text', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: '<img src=x onerror=alert(1)>' });

  await page.getByRole('button', { name: /^Für die Tierarztpraxis/ }).click();
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'PDF erstellen und teilen' }).click();
  const pdf = await popup;
  await expect(pdf.getByRole('heading', { name: '<img src=x onerror=alert(1)>' })).toBeVisible();
  expect(await pdf.locator('img[src="x"]').count()).toBe(0);
  expect(seen.errors).toEqual([]);
});
