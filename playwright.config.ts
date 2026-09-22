/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright gegen den Web-Export (dist/), ausgeliefert mit denselben
 * Sicherheits-Headern wie auf dem Server. Chrome bei 320, 768 und 1440 Pixeln,
 * in der CI bei jedem Push. Vorher: `bun run export:web`.
 *
 * Safari (WebKit) und Firefox auf Geräten: playwright.browsers.config.ts,
 * vor jedem Deploy der Vorschau.
 */
const PORT = 8096;

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: 'de-CH',
    timezoneId: 'Europe/Zurich',
  },
  webServer: {
    command: `node scripts/serve-web.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    // Nie einen alten Server wiederverwenden: Er könnte einen alten Export zeigen.
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'Chrome 320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 720 } },
    },
    {
      name: 'Chrome 768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Chrome 1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
