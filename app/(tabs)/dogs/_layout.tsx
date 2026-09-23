import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { HeaderBack } from '@/ui/HeaderBack';
import { usePalette } from '@/ui/theme';
import { fontFamily } from '@/ui/tokens';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

// Wer direkt ein Profil öffnet, kommt mit «Zurück» zur Liste der Hunde.
export const unstable_settings = { initialRouteName: 'index' };

/** Zurück mit Beschriftung; im Browser mit eigener, grosser Tippfläche. */
function backOptions(label: string) {
  return {
    title: '',
    // Kein leerer Titel als Überschrift: Der Bildschirm hat seine eigene.
    headerTitle: () => null,
    headerBackTitle: label,
    headerLeft: Platform.OS === 'web' ? () => <HeaderBack label={label} /> : undefined,
  };
}

/** Hunde: Liste, Profil, Gesundheit – mit der Navigationsleiste des Systems. */
export default function DogsLayout() {
  const palette = usePalette();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: palette.pebble },
        headerTintColor: palette.graphite,
        headerTitleStyle: { fontFamily: fontFamily.bold, fontSize: 17, color: palette.graphite },
        headerBackTitleStyle: { fontFamily: fontFamily.medium, fontSize: 17 },
        contentStyle: { backgroundColor: palette.pebble },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]/index" options={backOptions('Hunde')} />
      <Stack.Screen name="[id]/health" options={backOptions('Profil')} />
      <Stack.Screen name="[id]/medication" options={backOptions('Profil')} />
      <Stack.Screen name="[id]/weight" options={backOptions('Profil')} />
      <Stack.Screen name="[id]/diary" options={backOptions('Profil')} />
      <Stack.Screen name="[id]/documents" options={backOptions('Profil')} />
    </Stack>
  );
}
