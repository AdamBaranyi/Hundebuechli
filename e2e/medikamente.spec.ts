/// <reference types="node" />
import { expect, test } from '@playwright/test';

import { createDog, start } from './flows';
import { keyboardProblems, observe } from './helpers';
import { expectScreenQuality } from './quality';

/** Legt ein Medikament an; startet auf dem Profil des Hundes. */
async function addMedication(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /^Medikamente/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Medikamente' })).toBeVisible();
  await page.getByRole('button', { name: 'Medikament hinzufügen' }).click();
  await expect(page.getByRole('heading', { name: 'Neues Medikament' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Apoquel 16 mg');
  await page.getByRole('textbox', { name: 'Dosis' }).fill('halbe Tablette');
  await page.getByRole('checkbox', { name: '18:00' }).click();
  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByRole('heading', { name: 'Neues Medikament' })).toBeHidden();
}

test('Medikament anlegen: es steht im Fahrplan und lässt sich stempeln', async ({
  page,
  baseURL,
}) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Mila' });
  await addMedication(page);

  await expect(page.getByRole('button', { name: /^Apoquel 16 mg/ })).toContainText(
    'halbe Tablette, 08:00 und 18:00',
  );
  await expectScreenQuality(page, seen, 'Medikamente');

  await page.getByRole('link', { name: 'Als Nächstes' }).click();
  await expect(page.getByRole('heading', { name: 'Heute' })).toBeVisible();
  await expect(page.getByText('08:00', { exact: true })).toBeVisible();
  await expect(page.getByText('18:00', { exact: true })).toBeVisible();

  const stamp = page.getByRole('button', {
    name: 'Apoquel 16 mg für Mila um 08:00 als gegeben stempeln',
  });
  await stamp.click();
  await expect(
    page.getByRole('button', {
      name: 'Apoquel 16 mg für Mila gegeben um 10:00. Tippen, um es zurückzunehmen.',
    }),
  ).toBeVisible();
  // Die Zeile bleibt an ihrem Platz, die zweite Uhrzeit auch.
  await expect(page.getByText('Gegeben um 10:00')).toBeVisible();
  await expect(page.getByText('18:00', { exact: true })).toBeVisible();
  await expectScreenQuality(page, seen, 'Als Nächstes mit Fahrplan');
});

test('Uhrzeit der Erinnerungen lässt sich einstellen', async ({ page, baseURL }) => {
  const seen = await observe(page, baseURL ?? '');
  await start(page);
  await createDog(page, { name: 'Mila' });

  await page.getByRole('link', { name: 'Einstellungen' }).click();
  await expect(page.getByRole('heading', { name: 'Erinnerungen' })).toBeVisible();
  await expect(
    page.getByText(
      'In der Vorschau im Browser gibt es keine Erinnerungen. Die Termine stehen hier.',
    ),
  ).toBeVisible();

  const time = page.getByRole('textbox', { name: 'Uhrzeit der Terminerinnerungen' });
  await expect(time).toHaveValue('08:00');
  await time.fill('19:30');
  await page.getByRole('radio', { name: 'Drei Tage vorher' }).click();
  await expect(time).toHaveValue('19:30');

  await expectScreenQuality(page, seen, 'Einstellungen');
  expect(await keyboardProblems(page), 'Einstellungen per Tastatur').toEqual([]);

  // Nach dem Wechsel und zurück steht die Einstellung noch.
  await page.getByRole('link', { name: 'Als Nächstes' }).click();
  await page.getByRole('link', { name: 'Einstellungen' }).click();
  await expect(page.getByRole('textbox', { name: 'Uhrzeit der Terminerinnerungen' })).toHaveValue(
    '19:30',
  );
  await expect(page.getByRole('radio', { name: 'Drei Tage vorher' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

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
