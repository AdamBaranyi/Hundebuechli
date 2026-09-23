import { screen, userEvent } from '@testing-library/react-native';

import { createDog } from '@/db/repositories/dogs';
import { listWeights, saveWeight } from '@/db/repositories/weights';
import { WeightScreen } from '@/features/weights/WeightScreen';
import { renderWithData } from '@/test/render-with-data';
import { textSizes } from '@/ui/__tests__/text-sizes';

jest.mock('expo-router', () => ({
  ...jest.requireActual<object>('expo-router'),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  useFocusEffect: (effect: () => void) =>
    jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
}));

function WeightScreenFor({ get }: { get: () => string }) {
  return <WeightScreen dogId={get()} />;
}

describe('Gewicht', () => {
  it('zeigt den letzten Wert, die Veränderung in Worten und die Tabelle', async () => {
    let id = '';
    const { container } = await renderWithData(<WeightScreenFor get={() => id} />, (db) => {
      id = createDog(db, { name: 'Bäri' }).id;
      saveWeight(db, { dogId: id, date: '2026-06-20', grams: 13200 });
      saveWeight(db, { dogId: id, date: '2026-09-22', grams: 13800 });
    });
    expect(await screen.findByText('13.8 kg')).toBeOnTheScreen();
    expect(screen.getByText('Gewogen am 22. September 2026')).toBeOnTheScreen();
    expect(screen.getByText('0.6 kg mehr als am 20. Juni 2026')).toBeOnTheScreen();
    expect(
      screen.getByRole('image', { name: 'Gewichtskurve von Bäri mit 2 Werten' }),
    ).toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole('radio', { name: 'Tabelle' }));
    expect(await screen.findByText('Veränderung')).toBeOnTheScreen();
    expect(screen.getByText('+0.6 kg')).toBeOnTheScreen();
    expect(textSizes(container).filter((size) => (size.fontSize ?? 0) < 16)).toEqual([]);
  });

  it('sagt beim ersten Wert, dass die Veränderung ab jetzt kommt', async () => {
    let id = '';
    await renderWithData(<WeightScreenFor get={() => id} />, (db) => {
      id = createDog(db, { name: 'Bäri' }).id;
      saveWeight(db, { dogId: id, date: '2026-09-22', grams: 13800 });
    });
    expect(
      await screen.findByText('Der erste Wert – ab jetzt zeigt die App die Veränderung.'),
    ).toBeOnTheScreen();
  });

  it('löscht eine Wiegung nach Rückfrage', async () => {
    let id = '';
    const { db } = await renderWithData(<WeightScreenFor get={() => id} />, (database) => {
      id = createDog(database, { name: 'Bäri' }).id;
      saveWeight(database, { dogId: id, date: '2026-09-22', grams: 13800 });
    });
    const user = userEvent.setup();
    await user.press(await screen.findByRole('radio', { name: 'Tabelle' }));
    await user.press(
      screen.getByRole('button', { name: 'Wiegung vom 22. September 2026, 13.8 kg, löschen' }),
    );
    await user.press(screen.getByRole('button', { name: 'Wiegung löschen' }));
    expect(listWeights(db, id)).toEqual([]);
  });
});
