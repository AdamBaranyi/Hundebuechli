/// <reference types="node" />
import { expect, type Page } from '@playwright/test';

import { openScreen } from './helpers';

/** Die Tests spielen am Dienstag, 22. September 2026, 10 Uhr in Zürich. */
export const TODAY = new Date('2026-09-22T10:00:00+02:00');

export async function start(page: Page, path = '/') {
  await page.clock.setFixedTime(TODAY);
  await openScreen(page, path);
}

type DogFields = { name: string; breed?: string; chip?: string; sex?: 'Rüde' | 'Hündin' };

/** Legt einen Hund an, vom Erststart oder aus der Liste, und wartet auf sein Profil. */
export async function createDog(page: Page, dog: DogFields) {
  const first = page.getByRole('button', { name: 'Ersten Hund anlegen' });
  if (await first.isVisible()) {
    await first.click();
  } else {
    await page.getByRole('link', { name: 'Hunde', exact: true }).click();
    await page.getByRole('button', { name: 'Hund hinzufügen' }).click();
  }
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(dog.name);
  if (dog.breed) await page.getByRole('textbox', { name: 'Rasse oder Mischung' }).fill(dog.breed);
  if (dog.sex) await page.getByRole('radio', { name: dog.sex }).click();
  if (dog.chip) await page.getByRole('textbox', { name: 'Chipnummer' }).fill(dog.chip);
  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByRole('heading', { level: 1, name: dog.name })).toBeVisible();
}

type EntryFields = {
  kind: 'Impfung' | 'Entwurmung' | 'Zecken- und Flohschutz' | 'Tierarztbesuch';
  product?: string;
  /** «3 Monate» aus der Schnellwahl oder ein Datum wie «25.09.2026». */
  due?: string;
  dog?: string;
};

/** Erfasst einen Eintrag im Formular; startet auf einem Bildschirm mit «Eintrag hinzufügen». */
export async function addEntry(page: Page, entry: EntryFields) {
  await page.getByRole('button', { name: 'Eintrag hinzufügen' }).first().click();
  await expect(page.getByRole('heading', { name: 'Neuer Eintrag' })).toBeVisible();
  if (entry.dog) await page.getByRole('radio', { name: entry.dog }).click();
  await page.getByRole('radio', { name: entry.kind }).click();
  if (entry.product) {
    await page.getByRole('textbox', { name: 'Bezeichnung oder Produkt' }).fill(entry.product);
  }
  if (entry.due && /^\d/.test(entry.due) && entry.due.includes('.')) {
    await page.getByRole('radio', { name: 'Datum wählen' }).click();
    await page.getByRole('textbox', { name: 'Datum der nächsten Fälligkeit' }).fill(entry.due);
  } else if (entry.due) {
    await page.getByRole('radio', { name: entry.due, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Sichern' }).click();
  await expect(page.getByRole('heading', { name: 'Neuer Eintrag' })).toBeHidden();
}
