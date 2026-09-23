import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabsText } from '@/content/tabs';

import { AppText } from './AppText';
import { Icon } from './Icon';
import type { IconName } from './icon-shapes';
import { usePalette } from './theme';
import { space } from './tokens';

type ButtonProps = TabTriggerSlotProps & { icon: IconName; label: string };

const web = Platform.OS === 'web';

/** Ein Eintrag der Leiste: Symbol und Beschriftung in 16 px, der aktive mit Kapsel. */
const TabButton = forwardRef<View, ButtonProps>(function TabButton(
  { icon, label, isFocused, ...props },
  ref,
) {
  const palette = usePalette();
  return (
    <Pressable
      {...props}
      ref={ref}
      // Im Browser sind die Einträge Verweise, auf dem Gerät Reiter.
      role={web ? 'link' : 'tab'}
      accessibilityLabel={label}
      aria-current={web && isFocused ? 'page' : undefined}
      accessibilityState={web ? undefined : { selected: isFocused }}
      style={[styles.item, isFocused ? { backgroundColor: palette.line } : null]}
    >
      <Icon name={icon} size={26} color={isFocused ? 'graphite' : 'pencil'} />
      <AppText
        variant="secondary"
        weight={isFocused ? 'bold' : 'medium'}
        color={isFocused ? 'graphite' : 'pencil'}
        style={styles.label}
      >
        {label}
      </AppText>
    </Pressable>
  );
});

/**
 * Die eigene Tab-Leiste, auf dem Gerät wie im Browser: schwebend, mindestens
 * 90 % deckend, Symbol über der Beschriftung in 16 px. Die native Leiste des
 * Systems schob bei 16 pt das Symbol in den Text (Gerätetest, E-40).
 */
export function AppTabs() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <Tabs style={styles.tabs}>
      <TabSlot />
      <TabList asChild>
        <View
          role="navigation"
          accessibilityLabel={tabsText.navigation}
          // Der Slot von TabList nimmt nur einen flachen Stil, kein Array.
          style={StyleSheet.flatten([
            styles.bar,
            {
              bottom: insets.bottom + space.s3,
              backgroundColor: palette.glass,
              borderColor: palette.glassEdge,
            },
          ])}
        >
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="stamp" label={tabsText.next} />
          </TabTrigger>
          <TabTrigger name="dogs" href="/dogs" asChild>
            <TabButton icon="tag" label={tabsText.dogs} />
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton icon="sliders" label={tabsText.settings} />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    width: '92%',
    maxWidth: 420,
    padding: 6,
    borderWidth: 1,
    borderRadius: 34,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4, // Luft zwischen Symbol und Beschriftung
    minHeight: 64,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 28,
  },
  label: { textAlign: 'center' },
});
