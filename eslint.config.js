const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

// Die App enthält keinen Netzwerkcode (Auftrag, Abschnitt 6). Das ist keine
// Absicht, sondern eine Eigenschaft, die hier durchgesetzt wird: Wer in app/
// oder src/ eine Anfrage einbaut, bekommt einen Fehler, und die CI bleibt rot.
// Ein Test (scripts/__tests__/eslint-rules.test.js) prüft, dass die Regeln
// greifen.
const NETWORK_MESSAGE = 'Die App ist offline und stellt keine Netzwerkanfragen.';

const networkGlobals = ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'Request'].map(
  (name) => ({ name, message: NETWORK_MESSAGE }),
);

const networkProperties = ['window', 'globalThis', 'self', 'global']
  .flatMap((object) =>
    ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource'].map((property) => ({
      object,
      property,
      message: NETWORK_MESSAGE,
    })),
  )
  .concat([{ object: 'navigator', property: 'sendBeacon', message: NETWORK_MESSAGE }]);

const networkImports = [
  'axios',
  'ky',
  'got',
  'node-fetch',
  'cross-fetch',
  'isomorphic-fetch',
  'undici',
  'superagent',
  'expo/fetch',
  'expo-web-browser',
  'http',
  'https',
  'node:http',
  'node:https',
  'net',
  'node:net',
].map((name) => ({ name, message: NETWORK_MESSAGE }));

// expo-file-system kann Dateien laden und hochladen. Diese Funktionen sind
// Netzwerkcode, auch wenn sie im Dateimodul stehen.
const fileNetworkFunctions = [
  'downloadAsync',
  'uploadAsync',
  'createDownloadResumable',
  'createUploadTask',
  'downloadFileAsync',
].map((name) => ({
  selector: `MemberExpression[property.name='${name}']`,
  message: NETWORK_MESSAGE,
}));

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.expo/**',
      'src/db/migrations/**',
    ],
  },
  {
    rules: {
      // Projektregel: höchstens 400 physische Zeilen je Code-Datei. Das Skript
      // check:file-length deckt zusätzlich Formate ab, die ESLint nicht sieht.
      'max-lines': ['error', { max: 400, skipBlankLines: false, skipComments: false }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Fremde Daten kommen als unknown herein und werden mit Zod geprüft.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Tests und Skripte laufen in Node und Jest.
    files: ['scripts/**', '**/*.test.{js,ts,tsx}', 'jest.setup.ts', '*.config.{js,ts}'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    files: ['app/**', 'src/**'],
    rules: {
      'no-restricted-globals': ['error', ...networkGlobals],
      'no-restricted-properties': ['error', ...networkProperties],
      'no-restricted-imports': ['error', { paths: networkImports }],
      'no-restricted-syntax': ['error', ...fileNetworkFunctions],
    },
  },
]);
