/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

import base from './playwright.config';

/**
 * Dieselben Tests in den Engines von Safari und Firefox, auf Geräten statt nur
 * in Breiten: iPhone und iPad mit Berührung, Pixeldichte und iOS-Kennung,
 * dazu Safari und Firefox am Desktop. WebKit auf dem Mac ist Safaris Engine,
 * nicht iOS selbst – das echte iPhone bleibt das Geräteprotokoll.
 *
 * Nicht in der CI, beide Browser sind ein eigener Download. Vor jedem Deploy
 * der Vorschau: `bun run export:web`, dann `bun run test:e2e:browsers`.
 */
/**
 * Firefox auf dem Mac springt mit Tab sonst nur zwischen Textfeldern, wie es
 * die Systemeinstellung «Tastaturnavigation» vorgibt. Mit 7 erreicht Tab alle
 * Bedienelemente – so, wie Tastaturnutzende es einschalten.
 */
const firefoxTabbing = { firefoxUserPrefs: { 'accessibility.tabfocus': 7 } };

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    // Zwischenablage-Rechte kennt nur Chromium; die Tests prüfen sie dort.
    permissions: [],
  },
  projects: [
    { name: 'iPhone SE (WebKit)', use: { ...devices['iPhone SE (3rd gen)'] } },
    { name: 'iPhone 15 (WebKit)', use: { ...devices['iPhone 15'] } },
    { name: 'iPad Pro 11 (WebKit)', use: { ...devices['iPad Pro 11'] } },
    {
      name: 'Safari 1440',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Firefox 1440',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 },
        launchOptions: firefoxTabbing,
      },
    },
    {
      name: 'Firefox 390',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 390, height: 844 },
        launchOptions: firefoxTabbing,
      },
    },
  ],
});
