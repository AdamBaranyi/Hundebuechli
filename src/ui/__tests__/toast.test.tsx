import { act, render, screen } from '@testing-library/react-native';

import { ToastLayer } from '../ToastLayer';
import { clearToast, toast, TOAST_MS } from '../toast';
import { textSizes } from './text-sizes';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  clearToast();
  jest.useRealTimers();
});

// Die Meldung ist für Screenreader ausgeblendet; die Tests sehen trotzdem hin.
const pill = (text: string) => screen.queryByText(text, { includeHiddenElements: true });
const show = (text: string) => act(async () => toast(text));
const wait = (ms: number) => act(async () => void jest.advanceTimersByTime(ms));

describe('Kurzmeldung', () => {
  it('zeigt nichts, solange nichts gemeldet wurde', async () => {
    await render(<ToastLayer />);
    expect(screen.toJSON()).toBeNull();
  });

  it('zeigt die Meldung gross genug und räumt sie von selbst weg', async () => {
    const { container } = await render(<ToastLayer />);
    await show('Chipnummer kopiert.');
    expect(pill('Chipnummer kopiert.')).toBeOnTheScreen();
    expect(textSizes(container).filter((size) => (size.fontSize ?? 0) < 16)).toEqual([]);

    await wait(TOAST_MS - 1);
    expect(pill('Chipnummer kopiert.')).toBeOnTheScreen();
    await wait(1);
    expect(pill('Chipnummer kopiert.')).toBeNull();
  });

  it('ersetzt eine stehende Meldung und beginnt die Zeit von vorne', async () => {
    await render(<ToastLayer />);
    await show('Chipnummer kopiert.');
    await wait(TOAST_MS - 100);
    await show('Das liess sich nicht zurücknehmen.');
    await wait(TOAST_MS - 100);
    expect(pill('Chipnummer kopiert.')).toBeNull();
    expect(pill('Das liess sich nicht zurücknehmen.')).toBeOnTheScreen();
  });

  it('bleibt für Screenreader stumm, weil announce die Ansage macht', async () => {
    await render(<ToastLayer />);
    await show('Chipnummer kopiert.');
    const layer = pill('Chipnummer kopiert.')?.parent?.parent;
    expect(layer?.props['aria-hidden']).toBe(true);
    expect(layer?.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
