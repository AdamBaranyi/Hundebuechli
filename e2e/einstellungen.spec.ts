/// <reference types="node" />
import { expect, test } from '@playwright/test';

import { createDog, start } from './flows';
import { observe } from './helpers';
import { expectScreenQuality } from './quality';

test('Halterangaben: sichern und auf dem Plakat vorgeschlagen', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });

  await page.getByRole('link', { name: 'Einstellungen' }).click();
  await expect(page.getByRole('heading', { name: 'Halterangaben' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Telefon', exact: true }).fill('000 000 00 00');
  await page.getByRole('button', { name: 'Halterangaben sichern' }).click();
  await expect(
    page.getByText('Gib deinen Namen an, damit man weiss, wen man anruft.'),
  ).toBeVisible();

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Adam');
  await page.getByRole('button', { name: 'Halterangaben sichern' }).click();
  // Geprüft wird, was bleibt – nicht die Kurzmeldung, die nach 2,5 s verschwindet.
  await expect(
    page.getByText('Gib deinen Namen an, damit man weiss, wen man anruft.'),
  ).toBeHidden();
  await expectScreenQuality(page, seen, 'Einstellungen mit Halterangaben');

  // Der Reiter «Hunde» kehrt zum zuletzt offenen Profil zurück.
  await page.getByRole('link', { name: 'Hunde', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Bäri' })).toBeVisible();
  await page.getByRole('button', { name: /^Vermisst-Plakat/ }).click();
  await expect(page.getByRole('textbox', { name: 'Telefonnummer auf dem Plakat' })).toHaveValue(
    '000 000 00 00',
  );
});

test('Alle Daten löschen: nach der Rückfrage beginnt die App von vorne', async ({
  page,
  baseURL,
}) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });

  await page.getByRole('link', { name: 'Einstellungen' }).click();
  await page.getByRole('button', { name: 'Alle Daten löschen' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Wirklich alles löschen?' });
  await expect(dialog).toContainText('Es lässt sich nicht rückgängig machen.');
  await dialog.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Alle Daten löschen' }).click();
  await page
    .getByRole('alertdialog', { name: 'Wirklich alles löschen?' })
    .getByRole('button', { name: 'Alles löschen' })
    .click();
  await expect(page.getByRole('button', { name: 'Ersten Hund anlegen' })).toBeVisible();
  expect(seen.errors).toEqual([]);
});
