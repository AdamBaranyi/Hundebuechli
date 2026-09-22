import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { statesText } from '@/content/states';

import { AppText } from './AppText';
import { Button } from './Button';
import { IconShapes } from './Icon';
import { usePalette } from './theme';
import { radius, space } from './tokens';

/** Lädt: ruhig, mit Text für VoiceOver. */
export function LoadingState() {
  const palette = usePalette();
  return (
    <View style={styles.centered} role="progressbar" accessibilityLabel={statesText.loading}>
      <ActivityIndicator color={palette.graphite} />
      <AppText variant="secondary" color="pencil">
        {statesText.loading}
      </AppText>
    </View>
  );
}

/** Fehler: sagt, was passiert ist, und bietet einen neuen Versuch. */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centered} role="alert">
      <AppText weight="bold">{statesText.error}</AppText>
      <AppText variant="secondary" color="pencil" style={styles.text}>
        {statesText.errorHint}
      </AppText>
      <Button label={statesText.retry} variant="secondary" onPress={onRetry} />
    </View>
  );
}

type EmptyProps = {
  title: string;
  text?: string;
  action?: { label: string; onPress: () => void };
  /** Steht der Zustand allein auf dem Bildschirm, ist sein Titel die Hauptüberschrift. */
  heading?: 1 | 2;
};

/** Leer: ein grosses, leeres Stempelfeld, ein Satz, was als Nächstes kommt. */
export function EmptyState({ title, text, action, heading }: EmptyProps) {
  const palette = usePalette();
  return (
    <View style={[styles.empty, { backgroundColor: palette.sheet }]}>
      <Svg width={88} height={88} viewBox="0 0 56 56" aria-hidden>
        <Circle
          cx={28}
          cy={28}
          r={22}
          fill="none"
          stroke={palette.pencil}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <G
          transform="translate(17 17) scale(0.9167)"
          fill="none"
          stroke={palette.pencil}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <IconShapes name="stamp" />
        </G>
      </Svg>
      <AppText variant="subtitle" heading={heading} style={styles.text}>
        {title}
      </AppText>
      {text ? (
        <AppText variant="secondary" color="pencil" style={styles.text}>
          {text}
        </AppText>
      ) : null}
      {action ? <Button label={action.label} variant="text" onPress={action.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', gap: space.s3, paddingVertical: space.s8 },
  empty: {
    alignItems: 'center',
    gap: space.s3,
    paddingVertical: space.s8,
    paddingHorizontal: space.s4,
    borderRadius: radius.sheet,
  },
  text: { textAlign: 'center', maxWidth: 420 },
});
