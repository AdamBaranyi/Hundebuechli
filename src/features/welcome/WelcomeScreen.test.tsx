import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { listDogs } from '@/db/repositories/dogs';
import { getSettings } from '@/db/repositories/settings';
import { renderWithData } from '@/test/render-with-data';
import { textSizes } from '@/ui/__tests__/text-sizes';

import { WelcomeScreen } from './WelcomeScreen';

jest.mock('expo-router', () => ({
  ...jest.requireActual<object>('expo-router'),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
}));

// Nur das Datum steht still; Zeitgeber laufen echt, sonst wartet TanStack Query ewig.
beforeEach(() => {
  jest.useFakeTimers({
    now: new Date(2026, 8, 22, 9, 0),
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

describe('Erststart', () => {
  it('zeigt Versprechen und Hinweis zur Tiermedizin', async () => {
    await renderWithData(<WelcomeScreen />);
    expect(
      screen.getByRole('heading', {
        name: 'Alles zu deinem Hund griffbereit – und rechtzeitig erinnert.',
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Die App erinnert an Termine, die du einträgst. Sie gibt keine tiermedizinischen Empfehlungen und ersetzt weder die Tierarztpraxis noch den Heimtierausweis.',
      ),
    ).toBeOnTheScreen();
  });

  it('stempelt den heutigen Tag und sagt es VoiceOver', async () => {
    await renderWithData(<WelcomeScreen />);
    expect(
      screen.getByRole('img', { name: 'Hundebüechli, Stempel vom 22. September 2026' }),
    ).toBeOnTheScreen();
  });

  it('hat keine Schrift unter 16 pt', async () => {
    const { container } = await renderWithData(<WelcomeScreen />);
    const sizes = textSizes(container);
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.filter(({ fontSize }) => fontSize === undefined || fontSize < 16)).toEqual([]);
  });

  it('startet auf Wunsch mit Bäri und Mila als Beispieldaten', async () => {
    const { db } = await renderWithData(<WelcomeScreen />);
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Mit Beispieldaten starten' }));
    await waitFor(() => expect(listDogs(db).map((dog) => dog.name)).toEqual(['Bäri', 'Mila']));
    expect(getSettings(db).demoLoaded).toBe(true);
  });
});
