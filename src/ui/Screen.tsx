import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from './theme';
import { CONTENT_MAX_WIDTH, space } from './tokens';

type Props = {
  children: ReactNode;
  /** Bildschirm unter einer Navigationsleiste; der obere Rand kommt dann von ihr. */
  withHeader?: boolean;
  /** Bildschirm in der Tab-Leiste; die Leiste schwebt über dem Inhalt. */
  inTabs?: boolean;
  /** Blatt von unten; unter iOS beginnt es schon unter der Statusleiste. */
  inModal?: boolean;
};

/** Platz für die schwebende Tab-Leiste, damit der letzte Eintrag frei bleibt. */
const tabBarHeight = 96;

/**
 * Ein Bildschirm: Kiesel als Grund, Seitenrand 16, Abschnitte im Abstand 32.
 * Die sicheren Ränder rechnet der Bildschirm selbst ein; nur unter einer
 * Navigationsleiste kommt der obere Rand vom System.
 */
export function Screen({ children, withHeader = false, inTabs = false, inModal = false }: Props) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  // Ohne Navigationsleiste stand die Überschrift unter Uhr und Akku
  // (Gerätetest 23.09.2026); ein Blatt von unten beginnt ohnehin tiefer.
  const systemTop = withHeader || (Platform.OS === 'ios' && inModal);
  const top = space.s3 + (systemTop ? 0 : insets.top);
  const bottom = space.s8 + insets.bottom + (inTabs ? tabBarHeight : 0);
  return (
    <ScrollView
      role="main"
      // Im Browser scrollt dieser Bereich, nicht die Seite. Ohne Tastaturfokus
      // liesse er sich nur mit der Maus scrollen (axe: scrollable-region-focusable).
      focusable={Platform.OS === 'web'}
      contentInsetAdjustmentBehavior={systemTop ? 'automatic' : 'never'}
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
