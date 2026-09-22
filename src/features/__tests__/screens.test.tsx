import { screen, userEvent } from '@testing-library/react-native';

import { createDog } from '@/db/repositories/dogs';
import { createHealthEntry, listOpenDue } from '@/db/repositories/health';
import { renderWithData } from '@/test/render-with-data';
import { textSizes } from '@/ui/__tests__/text-sizes';

import { DogProfileScreen } from '../dogs/DogProfileScreen';
import { OverviewScreen } from '../overview/OverviewScreen';

// Ohne Navigator: Fokus heisst hier «einmal beim Anzeigen».
jest.mock('expo-router', () => ({
  ...jest.requireActual<object>('expo-router'),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  useFocusEffect: (effect: () => void) =>
    jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
}));

// Nur das Datum steht still: Zeitgeber und Mikroaufgaben laufen echt, sonst
// wartet TanStack Query auf eine Mikroaufgabe, die nie kommt.
beforeEach(() => {
  jest.useFakeTimers({
    now: new Date(2026, 8, 22, 10, 0),
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'queueMicrotask',
      'nextTick',
      'hrtime',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
    ],
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Hundeprofil', () => {
  it('sagt «gibt es nicht mehr» für eine unbekannte ID', async () => {
    await renderWithData(<DogProfileScreen dogId="00000000-0000-4000-8000-000000000009" />);
    expect(
      await screen.findByRole('heading', { name: 'Diesen Hund gibt es nicht mehr.' }),
    ).toBeOnTheScreen();
  });

  it('zeigt Name, Chipnummer in Gruppen und nie Schrift unter 16 pt', async () => {
    let id = '';
    const { container } = await renderWithData(<DogProfileScreenFor get={() => id} />, (db) => {
      id = createDog(db, {
        name: 'Bäri',
        breed: 'Whippet',
        sex: 'male',
        chipNumber: '756098123456789',
      }).id;
    });
    expect(await screen.findByRole('heading', { name: 'Bäri' })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Chipnummer kopieren, 756 0981 2345 6789' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Chipnummer aus der Schweiz')).toBeOnTheScreen();
    expect(textSizes(container).filter((t) => (t.fontSize ?? 0) < 16)).toEqual([]);
  });
});

function DogProfileScreenFor({ get }: { get: () => string }) {
  return <DogProfileScreen dogId={get()} />;
}

describe('Als Nächstes', () => {
  it('stempelt einen Termin, lässt die Zeile stehen und legt den Folgeeintrag an', async () => {
    const { db } = await renderWithData(<OverviewScreen />, (database) => {
      const dogId = createDog(database, { name: 'Bäri' }).id;
      createHealthEntry(database, {
        dogId,
        kind: 'deworming',
        date: '2026-06-25',
        product: 'Milbemax',
        nextDueDate: '2026-09-25',
        repeatMonths: 3,
      });
    });
    expect(await screen.findByRole('heading', { name: 'Diese Woche' })).toBeOnTheScreen();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Entwurmung für Bäri als erledigt stempeln' }));
    expect(
      await screen.findByRole('button', {
        name: 'Entwurmung für Bäri erledigt am 22. September. Tippen, um es zurückzunehmen.',
      }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Diese Woche' })).toBeOnTheScreen();
    expect(listOpenDue(db).map((entry) => entry.nextDueDate)).toEqual(['2026-12-22']);
  });

  it('zeigt einen leeren Zustand mit dem Weg zum ersten Eintrag', async () => {
    await renderWithData(<OverviewScreen />, (db) => {
      createDog(db, { name: 'Bäri' });
    });
    expect(await screen.findByText('Nichts fällig.')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Eintrag hinzufügen' })).toHaveLength(1);
  });
});
