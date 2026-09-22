import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabsText } from '@/content/tabs';

import { AppText } from './AppText';
import { Icon } from './Icon';
import type { IconName } from './icon-shapes';
import { usePalette } from './theme';
import { space } from './tokens';

type ButtonProps = TabTriggerSlotProps & { icon: IconName; label: string };

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
      role="link"
      accessibilityLabel={label}
      aria-current={isFocused ? 'page' : undefined}
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
 * Im Browser gibt es keine Tab-Leiste des Systems. Diese folgt dem Entwurf:
 * schwebende Leiste unten, mindestens 90 % deckend, damit der Text über
 * jedem Inhalt lesbar bleibt.
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
    gap: 2,
    minHeight: 60,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 28,
  },
  label: { textAlign: 'center' },
});
