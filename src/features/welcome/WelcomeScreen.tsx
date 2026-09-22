import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { common } from '@/content/common';
import { dogsText } from '@/content/dogs';
import { formatLongDate, formatStampDate } from '@/content/format';
import { welcome } from '@/content/welcome';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Notice } from '@/ui/Notice';
import { Screen } from '@/ui/Screen';
import { StampMark } from '@/ui/StampMark';

/**
 * Erststart: die Marke stempelt den heutigen Tag, darunter das Versprechen und
 * der Hinweis zur Tiermedizin. «Mit Beispieldaten starten» kommt an Tag 4 –
 * kein Knopf ohne Wirkung vorher.
 */
export function WelcomeScreen() {
  const today = new Date();
  return (
    <Screen>
      <View style={styles.intro}>
        <StampMark
          dayMonth={formatStampDate(today)}
          year={String(today.getFullYear())}
          label={welcome.stampLabel(formatLongDate(today))}
        />
        <AppText variant="largeTitle" heading={1}>
          {common.promise}
        </AppText>
        <AppText>{welcome.intro}</AppText>
        <AppText variant="secondary" color="pencil">
          {common.disclaimer}
        </AppText>
      </View>
      <Button label={dogsText.firstDog} onPress={() => router.push('/new-dog')} />
      {Platform.OS === 'web' ? <Notice text={common.webPreview} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 24, paddingTop: 20 },
});
