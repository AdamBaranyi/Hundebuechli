/// <reference types="node" />
import { expect, test } from '@playwright/test';

import { createDog, start } from './flows';
import { observe } from './helpers';
import { expectScreenQuality } from './quality';

test('Gewicht: Wert eintragen, Kurve und Tabelle', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });

  await page.getByRole('button', { name: /^Gewicht/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Gewicht' })).toBeVisible();
  await expect(page.getByText('Noch nichts gewogen.')).toBeVisible();

  await page.getByRole('button', { name: 'Gewicht eintragen' }).click();
  await page.getByRole('textbox', { name: 'Gewicht in Kilogramm' }).fill('13,2');
  await page.getByRole('textbox', { name: 'Datum', exact: true }).fill('20.06.2026');
  await page.getByRole('button', { name: 'Sichern' }).click();

  await page.getByRole('button', { name: 'Gewicht eintragen' }).click();
  await page.getByRole('textbox', { name: 'Gewicht in Kilogramm' }).fill('13,8');
  await page.getByRole('button', { name: 'Sichern' }).click();

  await expect(page.getByText('Gewogen am 22. September 2026')).toBeVisible();
  await expect(page.getByText('0.6 kg mehr als am 20. Juni 2026')).toBeVisible();
  await expect(page.getByRole('img', { name: /Gewichtskurve von Bäri/ }).first()).toBeVisible();
  await expectScreenQuality(page, seen, 'Gewicht mit Kurve');

  await page.getByRole('radio', { name: 'Tabelle' }).click();
  await expect(page.getByText('+0.6 kg')).toBeVisible();
  await expect(page.getByText('Veränderung')).toBeVisible();
  await expectScreenQuality(page, seen, 'Gewicht als Tabelle');
});
