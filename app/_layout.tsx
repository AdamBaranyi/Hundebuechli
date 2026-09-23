import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';

import { DatabaseProvider } from '@/db/DatabaseProvider';
import { NotificationHub } from '@/notifications/NotificationHub';
import { LiveRegion } from '@/ui/LiveRegion';
import { ToastLayer } from '@/ui/ToastLayer';
import { createQueryClient } from '@/db/query-client';
import { usePalette } from '@/ui/theme';
import { fontFiles } from '@/ui/tokens';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

// Der Startbildschirm bleibt, bis Schrift und Datenbank bereit sind.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontFiles);
  const [queryClient] = useState(createQueryClient);
  const palette = usePalette();
  const hideSplash = useCallback(() => void SplashScreen.hideAsync(), []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palette.pebble);
  }, [palette.pebble]);

  // Fehlt die Schrift wider Erwarten, läuft die App mit der Systemschrift weiter.
  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider onReady={hideSplash}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.pebble } }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="new-dog" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit-dog/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new-entry" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new-medication" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit-medication/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit-entry/[id]" options={{ presentation: 'modal' }} />
        </Stack>
        <NotificationHub />
        <LiveRegion />
        <ToastLayer />
      </DatabaseProvider>
    </QueryClientProvider>
  );
}
