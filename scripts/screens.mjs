/**
 * Bildschirmfotos für die Website, reproduzierbar aus der Web-Vorschau:
 * iPhone-Hochformat (390 × 844 Punkte, dreifache Auflösung), hell, mit den
 * erfundenen Beispielhunden Bäri und Mila – nie mit echten Daten.
 *
 * Vorher `bun run export:web`. Aufruf: node scripts/screens.mjs [Zielordner]
 * Ergebnis: PNG und, wenn cwebp installiert ist, WebP.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

const PORT = 8098;
const target = process.argv[2] ?? join(process.cwd(), 'docs', 'bilder');
mkdirSync(target, { recursive: true });

const server = spawn('node', ['scripts/serve-web.mjs', String(PORT)], { stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 800));

/** Heute um 09:30 in Zürich: Die Gabe um 08:00 ist fällig, die um 18:00 noch nicht. */
function todayAt(hours, minutes) {
  const now = new Date();
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(now);
  return new Date(
    `${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+02:00`,
  );
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'light',
    locale: 'de-CH',
    timezoneId: 'Europe/Zurich',
  });
  const page = await context.newPage();
  // Die Uhr läuft ab 09:30 weiter: Mit stehender Uhr bliebe die Stempel-Bewegung bei null stehen.
  await page.clock.install({ time: todayAt(9, 30) });
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page.getByRole('button', { name: 'Mit Beispieldaten starten' }).click();
  await page.getByRole('heading', { level: 1, name: 'Als Nächstes' }).waitFor();

  const shot = async (name) => {
    await page.waitForTimeout(700); // Stempel und Bilder setzen sich
    const file = join(target, `${name}.png`);
    await page.screenshot({ path: file });
    const webp = spawnSync('cwebp', [
      '-quiet',
      '-q',
      '86',
      file,
      '-o',
      file.replace(/\.png$/, '.webp'),
    ]);
    console.log(`${name}.png${webp.status === 0 ? ' und .webp' : ''}`);
  };

  // 1. «Als Nächstes»: den überfälligen Zeckenschutz und die Gabe von 08:00 stempeln.
  await page
    .getByRole('button', { name: /^Zecken- und Flohschutz für Bäri als erledigt stempeln/ })
    .click();
  await page.getByRole('button', { name: /^Apoquel 16 mg für Mila um 08:00/ }).click();
  await page.getByText('Gegeben um 9:30').waitFor();
  await shot('hundebuechli-als-naechstes');

  // 2. Das Hundeprofil von Bäri.
  await page.getByRole('link', { name: 'Hunde', exact: true }).click();
  await page.getByRole('button', { name: /^Bäri/ }).click();
  await page.getByRole('heading', { level: 1, name: 'Bäri' }).waitFor();
  await page.getByRole('img', { name: 'Foto von Bäri' }).first().waitFor();
  await shot('hundebuechli-hundeprofil');

  // 3. Gewicht von Mila mit Kurve. Nur über die Oberfläche: Ein Neuladen leert die Vorschau.
  await page.getByRole('button', { name: 'Hunde', exact: true }).click();
  await page.getByRole('button', { name: /^Mila/ }).click();
  await page.getByRole('button', { name: /^Gewicht/ }).click();
  await page.getByRole('heading', { level: 1, name: 'Gewicht' }).waitFor();
  await page.locator('polyline').first().waitFor();
  await shot('hundebuechli-gewicht');
  await context.close();
} finally {
  await browser.close();
  server.kill();
}
