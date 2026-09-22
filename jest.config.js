// Alle Tests rechnen in der Zeitzone der Nutzerinnen und Nutzer, damit Sommer-
// und Winterzeit wirklich geprüft werden, egal wo die CI läuft.
process.env.TZ = 'Europe/Zurich';

/**
 * Jest mit jest-expo: Domänenlogik, Repositories gegen sql.js und
 * Komponenten mit React Native Testing Library. Playwright gegen den
 * Web-Export läuft getrennt (playwright.config.ts, Ordner e2e/).
 *
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/{app,src,scripts}/**/*.test.{js,ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/', '<rootDir>/dist/'],
};
