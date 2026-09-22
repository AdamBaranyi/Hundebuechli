/**
 * Hält die ignore-Liste in .github/dependabot.yml deckungsgleich mit den
 * SDK-gebundenen Paketen: alles aus bundledNativeModules.json der
 * installierten Expo-SDK, das in package.json steht, dazu expo selbst. Fehlt
 * eines, hebt Dependabot es womöglich über die SDK-Fassung, und die App läuft
 * in Expo Go nicht mehr.
 *
 * @jest-environment node
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { parse } = require('yaml');

const ROOT = join(__dirname, '..', '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');

const pkg = JSON.parse(read('package.json'));
const bundled = JSON.parse(read('node_modules/expo/bundledNativeModules.json'));
const config = parse(read('.github/dependabot.yml'));

const bun = config.updates.find((entry) => entry['package-ecosystem'] === 'bun');
const ignore = bun.ignore;

/** Gekoppelte Pakete ausserhalb der SDK-Liste, nur für bestimmte Sprünge gesperrt. */
const PARTIAL = [
  '@types/react',
  '@react-native/jest-preset',
  'jest',
  '@types/jest',
  'typescript',
  '@types/node',
  'eslint',
];

describe('Dependabot und Expo SDK', () => {
  const dependencies = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  const sdkBound = dependencies.filter((name) => name === 'expo' || name in bundled).sort();

  it('sperrt jedes SDK-gebundene Paket ganz', () => {
    const fullyIgnored = ignore
      .filter((entry) => entry['update-types'] === undefined)
      .map((entry) => entry['dependency-name'])
      .sort();
    expect(fullyIgnored).toEqual(sdkBound);
  });

  it('sperrt übrige Pakete nur für bestimmte Sprünge und nur mit Begründung in der Datei', () => {
    const partial = ignore
      .filter((entry) => entry['update-types'] !== undefined)
      .map((entry) => entry['dependency-name'])
      .sort();
    expect(partial).toEqual([...PARTIAL].sort());
  });

  it('nennt kein Paket, das es im Projekt nicht gibt', () => {
    for (const entry of ignore) expect(dependencies).toContain(entry['dependency-name']);
  });

  it('hat keinen docker-Eintrag und überall Wartezeit und Zuweisung', () => {
    for (const entry of config.updates) {
      expect(entry['package-ecosystem']).not.toBe('docker');
      expect(entry.cooldown['default-days']).toBe(7);
      expect(entry.assignees).toEqual(['AdamBaranyi']);
    }
  });
});
