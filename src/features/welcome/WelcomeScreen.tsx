import { Platform, StyleSheet, View } from 'react-native';

import { common } from '@/content/common';
import { formatLongDate, formatStampDate } from '@/content/format';
import { welcome } from '@/content/welcome';
import { AppText } from '@/ui/AppText';
import { Notice } from '@/ui/Notice';
import { Screen } from '@/ui/Screen';
import { StampMark } from '@/ui/StampMark';

/**
 * Erststart: die Marke stempelt den heutigen Tag, darunter das Versprechen und
 * der Hinweis zur Tiermedizin. «Ersten Hund anlegen» kommt an Tag 2,
 * «Mit Beispieldaten starten» an Tag 4 – keine Knöpfe ohne Wirkung vorher.
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
      {Platform.OS === 'web' ? <Notice text={common.webPreview} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 24, paddingTop: 20 },
});
