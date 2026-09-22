// Jest läuft in Node. Dort gibt es das native Modul von expo-crypto nicht;
// die UUIDs kommen in den Tests aus Node selbst.
jest.mock('expo-crypto', () => {
  const { randomUUID } = jest.requireActual<{ randomUUID: () => string }>('node:crypto');
  return { randomUUID };
});

// Sichere Ränder ohne Gerät: feste Werte aus der Attrappe der Bibliothek.
jest.mock(
  'react-native-safe-area-context',
  () =>
    jest.requireActual<{ default: unknown }>('react-native-safe-area-context/jest/mock').default,
);
