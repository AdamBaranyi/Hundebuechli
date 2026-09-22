import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import type { IconName } from './icon-shapes';
import { usePalette } from './theme';
import { radius, space, touch } from './tokens';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  icon?: IconName;
  disabled?: boolean;
};

/**
 * Hauptaktion Graphit gefüllt, Zweitaktion mit Kante, Textknopf ohne. Kein
 * Pfeil im Knopftext. Gedrückt antwortet sofort, ohne Bewegung.
 */
export function Button({ label, onPress, variant = 'primary', icon, disabled = false }: Props) {
  const palette = usePalette();
  const filled = variant === 'primary';
  const textColor = filled ? 'onGraphite' : 'graphite';
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'text' ? styles.text : styles.boxed,
        {
          borderColor: variant === 'text' ? 'transparent' : palette.graphite,
          backgroundColor: filled ? palette.graphite : pressed ? palette.pressed : 'transparent',
          opacity: disabled ? 0.5 : filled && pressed ? 0.82 : 1,
        },
      ]}
    >
      <View style={styles.inner}>
        {icon ? <Icon name={icon} size={22} color={textColor} /> : null}
        <AppText weight="bold" color={textColor} style={styles.label}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderRadius: radius.capsule,
    justifyContent: 'center',
  },
  boxed: { minHeight: touch.primary, paddingHorizontal: space.s6, paddingVertical: space.s3 },
  text: { minHeight: touch.min, paddingHorizontal: space.s3, paddingVertical: space.s2 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s2,
  },
  label: { textAlign: 'center', flexShrink: 1 },
});
