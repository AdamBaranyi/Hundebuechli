import { act, render, screen, userEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { StampField } from '../StampField';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

function Harness() {
  const [done, setDone] = useState(false);
  return (
    <StampField
      id="00000000-0000-4000-8000-000000000001"
      state={done ? 'done' : 'open'}
      label={done ? 'erledigt' : 'stempeln'}
      stampText="22.9."
      onPress={() => setDone((value) => !value)}
    />
  );
}

type MotionStyle = { transform?: unknown; opacity?: unknown };

/** Der Stil der Hülle um den Stempel, flach gemacht. */
function stampStyle(): MotionStyle {
  const button = screen.getByRole('button', { name: 'erledigt' });
  const wrapper = button.children[0] as { props: { style?: unknown } };
  return (StyleSheet.flatten(wrapper.props.style as never) as MotionStyle | undefined) ?? {};
}

describe('Der Stempel-Moment', () => {
  afterEach(() => jest.restoreAllMocks());

  it('setzt sich mit Grösse und Drehung und gibt Haptik «Erfolg»', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(<Harness />);
    await userEvent.setup().press(screen.getByRole('button', { name: 'stempeln' }));
    expect(stampStyle().transform).toBeDefined();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('blendet bei «Bewegung reduzieren» nur ein – die Haptik bleibt', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const listen = jest.spyOn(AccessibilityInfo, 'addEventListener');
    await render(<Harness />);
    // Der Wert kommt asynchron; eine Änderung des Systems kommt über den Listener.
    await act(async () => {
      const call = listen.mock.calls.find(([event]) => String(event) === 'reduceMotionChanged');
      (call?.[1] as ((value: boolean) => void) | undefined)?.(true);
    });
    await userEvent.setup().press(screen.getByRole('button', { name: 'stempeln' }));
    expect(stampStyle().transform).toBeUndefined();
    expect(stampStyle().opacity).toBeDefined();
    expect(Haptics.notificationAsync).toHaveBeenCalled();
  });
});
