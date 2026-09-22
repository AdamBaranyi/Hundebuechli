import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { usePalette } from './theme';
import { space } from './tokens';

type Props = { label: string; value: boolean; onChange: (value: boolean) => void };

/**
 * Ja oder nein: Die ganze Zeile ist der Schalter, 56 hoch. Der Schieber ist
 * nur Zeichen – so bleibt die Tippfläche gross, auch im Browser, wo der
 * Schalter des Systems nur 40 × 20 Pixel misst.
 */
export function SwitchRow({ label, value, onChange }: Props) {
  const palette = usePalette();
  return (
    <Pressable
      role="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      aria-checked={value}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
    >
      <AppText style={styles.label}>{label}</AppText>
      <View
        aria-hidden
        style={[
          styles.track,
          {
            backgroundColor: value ? palette.graphite : palette.sheet,
            borderColor: value ? palette.graphite : palette.fieldBorder,
            alignItems: value ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            { backgroundColor: value ? palette.onGraphite : palette.fieldBorder },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s3,
    minHeight: 56,
  },
  label: { flex: 1 },
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: { width: 24, height: 24, borderRadius: 12 },
});
