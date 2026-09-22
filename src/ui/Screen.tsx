import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from './theme';
import { CONTENT_MAX_WIDTH, space } from './tokens';

type Props = { children: ReactNode };

/** Ein Bildschirm: Kiesel als Grund, Seitenrand 16, Abschnitte im Abstand 32. */
export function Screen({ children }: Props) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      role="main"
      // Im Browser scrollt dieser Bereich, nicht die Seite. Ohne Tastaturfokus
      // liesse er sich nur mit der Maus scrollen (axe: scrollable-region-focusable).
      focusable={Platform.OS === 'web'}
      style={[styles.scroll, { backgroundColor: palette.pebble }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.s3, paddingBottom: insets.bottom + space.s8 },
      ]}
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
