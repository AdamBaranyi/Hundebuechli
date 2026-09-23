import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { demoText } from '@/content/demo';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { usePalette } from '@/ui/theme';
import { radius, space } from '@/ui/tokens';

import { useSettings } from '../settings/queries';

/**
 * Solange Beispieldaten geladen sind, sagt ein Streifen das – mit dem Weg
 * hinaus. Nur auf dem Gerät: In der Web-Vorschau sind alle Daten erfunden,
 * und das sagt dort schon der Hinweis zur Vorschau (E-66).
 */
export function DemoBanner() {
  const palette = usePalette();
  const settings = useSettings();
  if (Platform.OS === 'web' || !settings.data?.demoLoaded) return null;
  return (
    <View
      role="note"
      style={[styles.banner, { borderColor: palette.fieldBorder, backgroundColor: palette.sheet }]}
    >
      <AppText weight="bold">{demoText.banner}</AppText>
      <AppText variant="secondary" color="pencil">
        {demoText.bannerHint}
      </AppText>
      <Button
        label={demoText.toSettings}
        variant="text"
        onPress={() => router.navigate('/settings')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: space.s1,
    paddingVertical: space.s3,
    paddingHorizontal: space.s4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.field,
  },
});
