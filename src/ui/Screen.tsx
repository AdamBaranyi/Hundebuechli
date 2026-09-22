import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from './theme';
import { CONTENT_MAX_WIDTH, space } from './tokens';

type Props = {
  children: ReactNode;
  /** Bildschirm unter einer Navigationsleiste; der obere Rand kommt dann von ihr. */
  withHeader?: boolean;
  /** Bildschirm in der Tab-Leiste; im Browser braucht die eigene Leiste unten Platz. */
  inTabs?: boolean;
};

/**
 * Ein Bildschirm: Kiesel als Grund, Seitenrand 16, Abschnitte im Abstand 32.
 * Unter iOS rechnet das System die sicheren Ränder selbst ein (auch unter den
 * nativen Tabs); unter Android und im Browser geschieht es hier.
 */
export function Screen({ children, withHeader = false, inTabs = false }: Props) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const ios = Platform.OS === 'ios';
  const top = space.s3 + (ios || withHeader ? 0 : insets.top);
  const bottom = space.s8 + (ios ? 0 : insets.bottom) + (inTabs && Platform.OS === 'web' ? 96 : 0);
  return (
    <ScrollView
      role="main"
      // Im Browser scrollt dieser Bereich, nicht die Seite. Ohne Tastaturfokus
      // liesse er sich nur mit der Maus scrollen (axe: scrollable-region-focusable).
      focusable={Platform.OS === 'web'}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      style={[styles.scroll, { backgroundColor: palette.pebble }]}
      contentContainerStyle={[styles.content, { paddingTop: top, paddingBottom: bottom }]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: space.edge,
    gap: space.section,
  },
});
