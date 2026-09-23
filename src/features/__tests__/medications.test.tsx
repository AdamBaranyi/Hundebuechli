import { screen, userEvent } from '@testing-library/react-native';

import { createDog } from '@/db/repositories/dogs';
import { createMedication, listDosesFrom } from '@/db/repositories/medications';
import { MedicationListScreen } from '@/features/medications/MedicationListScreen';
import { OverviewScreen } from '@/features/overview/OverviewScreen';
import { renderWithData } from '@/test/render-with-data';
import { textSizes } from '@/ui/__tests__/text-sizes';

jest.mock('expo-router', () => ({
  ...jest.requireActual<object>('expo-router'),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  useFocusEffect: (effect: () => void) =>
    jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
}));

// Nur das Datum steht still, damit «heute» und «jetzt» im Test feststehen.
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

const apoquel = (dogId: string) => ({
  dogId,
  name: 'Apoquel 16 mg',
  dose: 'halbe Tablette',
  times: [480, 1080],
  startDate: '2026-09-01',
});

describe('Medikamente eines Hundes', () => {
  it('zeigt Dosis und Uhrzeiten und nie Schrift unter 16 pt', async () => {
    let id = '';
    const { container } = await renderWithData(<MedicationListScreenFor get={() => id} />, (db) => {
      id = createDog(db, { name: 'Mila' }).id;
      createMedication(db, apoquel(id));
    });
    expect(await screen.findByText('Apoquel 16 mg')).toBeOnTheScreen();
    expect(screen.getByText('halbe Tablette, 08:00 und 18:00')).toBeOnTheScreen();
    expect(textSizes(container).filter((size) => (size.fontSize ?? 0) < 16)).toEqual([]);
  });
});

function MedicationListScreenFor({ get }: { get: () => string }) {
  return <MedicationListScreen dogId={get()} />;
}

describe('Fahrplan unter «Als Nächstes»', () => {
  it('stempelt eine Gabe, lässt die Zeile stehen und schreibt sie ins Protokoll', async () => {
    const { db } = await renderWithData(<OverviewScreen />, (database) => {
      const dogId = createDog(database, { name: 'Mila' }).id;
      createMedication(database, apoquel(dogId));
    });
    expect(await screen.findByRole('heading', { name: 'Heute' })).toBeOnTheScreen();
    // Zwei Uhrzeiten am Tag: zwei Zeilen mit derselben Beschreibung.
    expect(screen.getByText('08:00')).toBeOnTheScreen();
    expect(screen.getByText('18:00')).toBeOnTheScreen();
    expect(screen.getAllByText('Mila, halbe Tablette')).toHaveLength(2);

    await userEvent.setup().press(
      screen.getByRole('button', {
        name: 'Apoquel 16 mg für Mila um 08:00 als gegeben stempeln',
      }),
    );

    expect(
      await screen.findByRole('button', {
        name: 'Apoquel 16 mg für Mila gegeben um 10:00. Tippen, um es zurückzunehmen.',
      }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Heute' })).toBeOnTheScreen();
    expect(listDosesFrom(db, '2026-09-22T00:00')).toEqual([
      expect.objectContaining({ scheduledAt: '2026-09-22T08:00', givenAt: '2026-09-22T10:00' }),
    ]);
  });

  it('nimmt eine Gabe wieder zurück', async () => {
    const { db } = await renderWithData(<OverviewScreen />, (database) => {
      const dogId = createDog(database, { name: 'Mila' }).id;
      createMedication(database, { ...apoquel(dogId), times: [480] });
    });
    const user = userEvent.setup();
    await user.press(
      await screen.findByRole('button', {
        name: 'Apoquel 16 mg für Mila um 08:00 als gegeben stempeln',
      }),
    );
    await user.press(
      await screen.findByRole('button', {
        name: 'Apoquel 16 mg für Mila gegeben um 10:00. Tippen, um es zurückzunehmen.',
      }),
    );
    expect(
      await screen.findByRole('button', {
        name: 'Apoquel 16 mg für Mila um 08:00 als gegeben stempeln',
      }),
    ).toBeOnTheScreen();
    expect(listDosesFrom(db, '2026-09-22T00:00')).toEqual([]);
  });
});
