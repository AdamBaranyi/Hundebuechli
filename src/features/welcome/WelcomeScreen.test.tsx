import { render, screen } from '@testing-library/react-native';

import { textSizes } from '@/ui/__tests__/text-sizes';

import { WelcomeScreen } from './WelcomeScreen';

describe('Erststart', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 8, 22, 9, 0) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('zeigt Versprechen und Hinweis zur Tiermedizin', async () => {
    await render(<WelcomeScreen />);
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
    await render(<WelcomeScreen />);
    expect(
      screen.getByRole('img', { name: 'Hundebüechli, Stempel vom 22. September 2026' }),
    ).toBeOnTheScreen();
  });

  it('hat keine Schrift unter 16 pt', async () => {
    const { container } = await render(<WelcomeScreen />);
    const sizes = textSizes(container);
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.filter(({ fontSize }) => fontSize === undefined || fontSize < 16)).toEqual([]);
  });
});
