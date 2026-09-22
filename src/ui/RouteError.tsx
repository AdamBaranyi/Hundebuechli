import type { ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { errors } from '@/content/errors';

import { AppText } from './AppText';
import { Button } from './Button';
import { Screen } from './Screen';

/**
 * Fehlergrenze je Route (Export ErrorBoundary von Expo Router). Sagt ruhig,
 * was passiert ist, und bietet einen neuen Versuch. Der Fehler selbst kann
 * Personendaten enthalten und wird darum nicht angezeigt oder protokolliert.
 */
export function RouteError({ retry }: ErrorBoundaryProps) {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);
  return (
    <Screen>
      <View style={styles.box}>
        <AppText variant="largeTitle" heading={1}>
          {errors.routeTitle}
        </AppText>
        <AppText>{errors.routeText}</AppText>
        <Button label={errors.retry} onPress={() => void retry()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: { gap: 24, paddingTop: 32 },
});
