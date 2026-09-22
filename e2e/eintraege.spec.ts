/// <reference types="node" />
import { expect, test } from '@playwright/test';

import { addEntry, createDog, start } from './flows';
import { keyboardProblems, observe } from './helpers';
import { expectScreenQuality } from './quality';

test('Eintrag erfassen: Schnellwahl rechnet die nächste Fälligkeit', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });
  await page.getByRole('button', { name: 'Eintrag hinzufügen' }).first().click();
  await expect(page.getByRole('heading', { name: 'Neuer Eintrag' })).toBeVisible();

  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByText('Wähle die Art des Eintrags.')).toBeVisible();

  await page.getByRole('radio', { name: 'Entwurmung' }).click();
  await page.getByRole('radio', { name: '3 Monate' }).click();
  await expect(page.getByText('Nächste Fälligkeit: Dienstag, 22. Dezember 2026')).toBeVisible();
  await page.getByRole('radio', { name: '1 Monat' }).click();
  await expect(page.getByText('Nächste Fälligkeit: Donnerstag, 22. Oktober 2026')).toBeVisible();
  await expectScreenQuality(page, seen, 'Formular Eintrag');
  expect(await keyboardProblems(page), 'Formular Eintrag per Tastatur').toEqual([]);

  await page.getByRole('textbox', { name: 'Bezeichnung oder Produkt' }).fill('Milbemax');
  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByRole('heading', { name: 'Das Jahr in Stempeln' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Gesundheit/ })).toContainText('1 Eintrag');
  await expect(
    page.getByRole('button', { name: /^Entwurmung: erledigt im September\./ }),
  ).toBeVisible();
});

test('Als Nächstes: stempeln, die Zeile bleibt, zurücknehmen', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });
  await addEntry(page, { kind: 'Entwurmung', product: 'Milbemax', due: '25.09.2026' });
  await addEntry(page, { kind: 'Impfung', product: 'Tollwut', due: '03.11.2026' });

  await page.getByRole('link', { name: 'Als Nächstes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Diese Woche' })).toBeVisible();
  await expect(page.getByText('Fällig am Freitag, 25.9.')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Später' })).toBeVisible();
  await expect(page.getByText('Fällig am 3. November')).toBeVisible();
  await expectScreenQuality(page, seen, 'Als Nächstes');
  expect(await keyboardProblems(page), 'Als Nächstes per Tastatur').toEqual([]);

  await page.getByRole('button', { name: 'Entwurmung für Bäri als erledigt stempeln' }).click();
  const stamped = page.getByRole('button', {
    name: 'Entwurmung für Bäri erledigt am 22. September. Tippen, um es zurückzunehmen.',
  });
  await expect(stamped).toBeVisible();
  await expect(page.getByText('Erledigt am 22.9.')).toBeVisible();
  // Die Zeile bleibt in «Diese Woche», bis der Bildschirm neu geöffnet wird.
  await expect(page.getByRole('heading', { level: 2, name: 'Diese Woche' })).toBeVisible();

  await stamped.click();
  await expect(page.getByText('Fällig am Freitag, 25.9.')).toBeVisible();

  await page.getByRole('button', { name: 'Entwurmung für Bäri als erledigt stempeln' }).click();
  await expect(page.getByText('Erledigt am 22.9.')).toBeVisible();
  await page.getByRole('link', { name: 'Hunde', exact: true }).click();
  await page.getByRole('link', { name: 'Als Nächstes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Diese Woche' })).toHaveCount(0);
  await expect(page.getByText('Fällig am 3. November')).toBeVisible();
});

test('Gesundheit: Liste, bearbeiten und löschen mit Rückfrage', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Bäri' });
  await addEntry(page, { kind: 'Tierarztbesuch', product: 'Jahreskontrolle' });
  await page.getByRole('button', { name: /^Gesundheit/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Gesundheit' })).toBeVisible();
  await expectScreenQuality(page, seen, 'Gesundheit');

  await page.getByRole('button', { name: /Tierarztbesuch/ }).click();
  await expect(page.getByRole('heading', { name: 'Eintrag bearbeiten' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Bezeichnung oder Produkt' }).fill('Impfkontrolle');
  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByText('22. September 2026, Impfkontrolle')).toBeVisible();

  await page.getByRole('button', { name: /Tierarztbesuch/ }).click();
  await page.getByRole('button', { name: 'Eintrag löschen' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eintrag löschen' }).click();
  await expect(
    page.getByText('Noch keine Einträge. Trag ein, was im Büechli steht.'),
  ).toBeVisible();
});

test('Adresse direkt aufgerufen: die Vorschau beginnt frisch mit dem Erststart', async ({
  page,
}) => {
  // Im Browser speichert die Vorschau nichts; jeder Aufruf beginnt ohne Hunde.
  // Die Prüfung der IDs aus Links steht in den Komponententests.
  for (const path of ['/dogs/keine-uuid', '/edit-entry/%3Cscript%3E', '/new-entry?dogId=x']) {
    await start(page, path);
    await expect(page.getByRole('button', { name: 'Ersten Hund anlegen' })).toBeVisible();
  }
});
