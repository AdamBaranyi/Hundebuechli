import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { tabsText } from '@/content/tabs';

import { usePalette } from './theme';
import { fontFamily } from './tokens';

/**
 * Die Tab-Leiste des Systems (unter iOS 26 Liquid Glass, unter Android
 * Material 3) mit Beschriftung in 16 pt statt der rund 10 pt der Vorgabe.
 * Ob das System die Grösse übernimmt, belegt das Geräteprotokoll (E-17).
 * Im Browser gilt AppTabs.web.tsx.
 */
export function AppTabs() {
  const palette = usePalette();
  const label = { fontSize: 16, fontFamily: fontFamily.medium, color: palette.pencil };
  return (
    <NativeTabs
      labelStyle={{
        default: label,
        selected: { ...label, fontFamily: fontFamily.bold, color: palette.graphite },
      }}
      tintColor={palette.graphite}
      iconColor={{ default: palette.pencil, selected: palette.graphite }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{tabsText.next}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="seal" md="approval" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dogs">
        <NativeTabs.Trigger.Label>{tabsText.dogs}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="tag" md="sell" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{tabsText.settings}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="slider.horizontal.3" md="tune" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
