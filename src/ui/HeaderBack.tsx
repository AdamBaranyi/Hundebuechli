import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { touch } from './tokens';

/**
 * Zurück in der Navigationsleiste im Browser. Die Vorgabe von React
 * Navigation ist dort nur 30 × 30 Pixel gross; diese hat 48 und eine
 * Beschriftung. Auf dem Gerät bleibt der Zurück-Knopf des Systems.
 */
export function HeaderBack({ label }: { label: string }) {
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={() => router.back()}
      style={({ pressed }) => [styles.back, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name="chevronLeft" size={24} />
      <AppText weight="medium">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: touch.min,
    minWidth: touch.min,
    paddingRight: 8,
  },
});
