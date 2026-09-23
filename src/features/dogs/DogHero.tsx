import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { dogsText } from '@/content/dogs';
import { usePalette } from '@/ui/theme';
import { space } from '@/ui/tokens';

type Props = { name: string; photoUri: string | null; children: ReactNode };

/** So hoch steht das Foto oben im Profil, wie im Entwurf. */
const PHOTO_HEIGHT = 380;

/**
 * Kopf des Hundeprofils nach dem Entwurf: das Foto randlos oben, darüber ein
 * Blatt mit gerundeter Oberkante, das den Namen trägt. Ohne Foto steht das
 * Blatt allein; die Knöpfe zum Foto stehen dann darüber.
 */
export function DogHero({ name, photoUri, children }: Props) {
  const palette = usePalette();
  if (!photoUri) return <View style={styles.plain}>{children}</View>;
  return (
    <View style={styles.hero}>
      <Image
        source={{ uri: photoUri }}
        accessibilityLabel={dogsText.photo.label(name)}
        accessibilityRole="image"
        resizeMode="cover"
        style={[styles.photo, { backgroundColor: palette.line }]}
      />
      <View style={[styles.sheet, { backgroundColor: palette.pebble }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Randlos: Der Bildschirm hat 16 Seitenrand und 12 oben, das Foto nimmt beides weg.
  hero: { marginHorizontal: -space.edge, marginTop: -space.s3 },
  photo: { width: '100%', height: PHOTO_HEIGHT },
  sheet: {
    marginTop: -36,
    paddingTop: space.s6,
    paddingHorizontal: space.edge,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: space.s4,
  },
  plain: { gap: space.s4 },
});
