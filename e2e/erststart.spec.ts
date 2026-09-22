/// <reference types="node" />
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import {
  cspViolations,
  horizontalOverflow,
  keyboardProblems,
  observe,
  openScreen,
  smallTargets,
  smallText,
  storedData,
} from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const colorScheme of ['light', 'dark'] as const) {
  test(`Erststart (${colorScheme}): lesbar, bedienbar, barrierefrei, ohne Netz nach aussen`, async ({
    page,
    baseURL,
  }) => {
    await page.emulateMedia({ colorScheme });
    const seen = await observe(page, baseURL ?? '');
    await openScreen(page, '/');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Alles zu deinem Hund griffbereit – und rechtzeitig erinnert.',
      }),
    ).toBeVisible();
    await expect(page.getByText('Sie gibt keine tiermedizinischen Empfehlungen')).toBeVisible();
    await expect(page.getByRole('img', { name: /^Hundebüechli, Stempel vom / })).toBeVisible();
    await expect(page.getByText('Vorschau im Browser.')).toBeVisible();

    expect(await horizontalOverflow(page), 'kein Querscrollen').toBeLessThanOrEqual(0);
    expect(await smallText(page), 'keine Schrift unter 16 px').toEqual([]);
    expect(await smallTargets(page), 'Tippflächen ab 48 × 48').toEqual([]);

    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(
      axe.violations.map((v) => `${v.id}: ${v.nodes.length}`),
      'axe ohne Befund',
    ).toEqual([]);

    expect(
      await page.evaluate(() => document.fonts.check('17px AtkinsonHyperlegibleNext-Regular')),
      'Schrift vom eigenen Ursprung geladen',
    ).toBe(true);
    expect(seen.foreignRequests, 'keine Anfragen an Dritte').toEqual([]);
    expect(await cspViolations(page), 'keine CSP-Verstösse').toEqual([]);
    expect(seen.errors, 'keine Fehler in der Konsole').toEqual([]);
  });
}

test('Tastatur: jedes Bedienelement erreichbar, mit sichtbarem Fokus', async ({ page }) => {
  await openScreen(page, '/');
  expect(await keyboardProblems(page)).toEqual([]);
});

test('Reduzierte Bewegung: nichts bewegt sich', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openScreen(page, '/');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('Die Vorschau speichert nichts im Browser', async ({ page }) => {
  await openScreen(page, '/');
  expect(await storedData(page)).toEqual({
    localStorage: 0,
    sessionStorage: 0,
    cookies: '',
    indexedDb: [],
  });
});

test('CSP-Gegenprobe: eingeschleustes HTML wird blockiert und gemeldet', async ({
  page,
  baseURL,
}) => {
  await observe(page, baseURL ?? '');
  await openScreen(page, '/');
  await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.innerHTML =
      '<img src="/fehlt.png" onerror="window.__eingeschleust = true">' +
      '<p style="color: red">eingeschleust</p>';
    document.body.append(probe);
  });
  await expect
    .poll(() => cspViolations(page))
    .toEqual(expect.arrayContaining([expect.stringMatching(/^script-src/)]));
  expect(await cspViolations(page)).toEqual(
    expect.arrayContaining([expect.stringMatching(/^style-src-attr/)]),
  );
  expect(await page.evaluate(() => '__eingeschleust' in window), 'Handler lief nicht').toBe(false);
});

test('Sicherheits-Header und CSP stehen in der Antwort', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("script-src 'self' 'wasm-unsafe-eval'");
  expect(headers['content-security-policy']).not.toMatch(/script-src[^;]*unsafe-inline/);
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('no-referrer');
  expect(await response.text()).toContain('http-equiv="Content-Security-Policy"');
});

test('Adresse mit Parametern, auch kaputt kodiert: die App lädt trotzdem', async ({
  page,
  baseURL,
}) => {
  const seen = await observe(page, baseURL ?? '');
  for (const query of ['?hund=B%C3%A4ri', '?kaputt=%E0%A4%A', '?x=%%%']) {
    await openScreen(page, `/${query}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(seen.errors).toEqual([]);
});
