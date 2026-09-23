import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { usePalette } from './theme';
import { radius, space, tabBarSpace } from './tokens';
import { useToastMessage } from './toast';

/** Die Meldung blendet in 150 ms ein – erlaubt auch bei reduzierter Bewegung. */
function Pill({ text }: { text: string }) {
  const palette = usePalette();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [opacity]);
  return (
    <Animated.View style={[styles.pill, { backgroundColor: palette.graphite, opacity }]}>
      <AppText variant="secondary" weight="medium" color="onGraphite" style={styles.text}>
        {text}
      </AppText>
    </Animated.View>
  );
}

/**
 * Kurzmeldung über der Tab-Leiste, etwa «Chipnummer kopiert». Sie nimmt keine
 * Tipps entgegen und bleibt für Screenreader unsichtbar: Die spricht bereits
 * `announce`.
 */
export function ToastLayer() {
  const message = useToastMessage();
  const insets = useSafeAreaInsets();
  if (!message) return null;
  return (
    <View
      pointerEvents="none"
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.layer, { bottom: insets.bottom + tabBarSpace }]}
    >
      <Pill key={message.id} text={message.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    maxWidth: 420,
    paddingVertical: space.s3,
    paddingHorizontal: space.s5,
    borderRadius: radius.capsule,
  },
  text: { textAlign: 'center' },
});
