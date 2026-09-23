import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { AppText } from '../AppText';
import { Screen } from '../Screen';
import { space } from '../tokens';

const iphone = { top: 59, bottom: 34, left: 0, right: 0 };

/** Der Bildschirm auf einem Gerät mit Uhr oben und Hinweisbalken unten. */
async function paddingOf(node: ReactNode) {
  await render(
    <SafeAreaInsetsContext.Provider value={iphone}>{node}</SafeAreaInsetsContext.Provider>,
  );
  // Der scrollende Bereich hat als Einziger einen Inhaltsrahmen.
  let view: { props: Record<string, unknown>; parent: unknown } | null = screen.getByText('Inhalt');
  while (view && !view.props.contentContainerStyle) {
    view = view.parent as typeof view;
  }
  if (!view) throw new Error('Kein Bildschirm gefunden');
  return StyleSheet.flatten(view.props.contentContainerStyle as never) as {
    paddingTop: number;
    paddingBottom: number;
  };
}

describe('Bildschirm auf dem Gerät', () => {
  it('hält die Überschrift unter der Uhr, wenn es keine Navigationsleiste gibt', async () => {
    const padding = await paddingOf(
      <Screen>
        <AppText>Inhalt</AppText>
      </Screen>,
    );
    expect(padding.paddingTop).toBe(iphone.top + space.s3);
  });

  it('überlässt den oberen Rand der Navigationsleiste', async () => {
    const padding = await paddingOf(
      <Screen withHeader>
        <AppText>Inhalt</AppText>
      </Screen>,
    );
    expect(padding.paddingTop).toBe(space.s3);
  });

  it('hält den letzten Eintrag über der Tab-Leiste frei', async () => {
    const padding = await paddingOf(
      <Screen inTabs>
        <AppText>Inhalt</AppText>
      </Screen>,
    );
    expect(padding.paddingBottom).toBeGreaterThan(iphone.bottom + space.s8);
  });
});
