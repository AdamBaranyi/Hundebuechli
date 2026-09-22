#!/usr/bin/env node
/**
 * Erzeugt App-Symbol, Startbild und Favicon als PNG aus dem Symbol des
 * Entwurfs (assets/icons/app-symbol.svg): weisses Büchlein mit
 * Graphit-Stempel auf Karmin. Gerendert mit Chromium aus Playwright, damit
 * die Bilder reproduzierbar aus dem SVG entstehen statt von Hand.
 *
 * Aufruf: node scripts/render-icons.mjs
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

const DIR = join(import.meta.dirname, '..', 'assets', 'icons');
const source = readFileSync(join(DIR, 'app-symbol.svg'), 'utf8');

/** Der Inhalt ohne Hintergrund: Büchlein und Stempel. */
const artwork = source
  .replace(/^[\s\S]*?<rect width="1024" height="1024" rx="228" fill="#B3223F"\/>/, '')
  .replace(/<\/svg>\s*$/, '');

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${body}</svg>`;

// Android schneidet das Vordergrundbild rund oder eckig zu und zeigt sicher
// nur die inneren zwei Drittel; darum dort verkleinert.
const safeZone = (body) =>
  `<g transform="translate(512 512) scale(0.72) translate(-512 -512)">${body}</g>`;
const silhouette = artwork
  .replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#FFFFFF"')
  .replace(/stroke="#[0-9A-Fa-f]{6}"/g, 'stroke="#FFFFFF"');

const IMAGES = [
  // iOS rundet die Ecken selbst: volles Quadrat ohne Transparenz.
  {
    file: 'icon.png',
    size: 1024,
    svg: svg(`<rect width="1024" height="1024" fill="#B3223F"/>${artwork}`),
  },
  { file: 'android-foreground.png', size: 1024, svg: svg(safeZone(artwork)) },
  { file: 'android-monochrome.png', size: 1024, svg: svg(safeZone(silhouette)) },
  { file: 'splash.png', size: 512, svg: source },
  { file: 'favicon.png', size: 48, svg: source },
];

const browser = await chromium.launch();
try {
  for (const image of IMAGES) {
    const page = await browser.newPage({ viewport: { width: image.size, height: image.size } });
    const sized = image.svg.replace(
      '<svg ',
      `<svg style="display:block;width:${image.size}px;height:${image.size}px" `,
    );
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${sized}</body></html>`,
    );
    await page.screenshot({ path: join(DIR, image.file), omitBackground: true });
    await page.close();
    console.log(`render-icons: ${image.file} (${image.size} × ${image.size})`);
  }
} finally {
  await browser.close();
}
