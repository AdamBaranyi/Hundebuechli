import { Image, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { usePalette } from './theme';

type Props = {
  /** Adresse des Fotos; ohne Foto steht die Hundemarke im Kreis. */
  uri?: string | null;
  /** «Alle»: das Zeichen für alle Hunde statt eines Fotos. */
  all?: boolean;
  selected?: boolean;
  size?: number;
};

/** Rundes Foto mit Luft zum Ring; gewählt mit einem Ring in Graphit. */
export function DogAvatar({ uri, all = false, selected = false, size = 56 }: Props) {
  const palette = usePalette();
  const inner = size - 6;
  return (
    <View
      aria-hidden
      style={[
        styles.ring,
        {
          width: size + 5,
          height: size + 5,
          borderRadius: size,
          borderColor: selected ? palette.graphite : 'transparent',
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: all ? palette.sheet : palette.line,
            },
          ]}
        >
          {/* Ohne Foto die Hundemarke: ein Zeichen statt eines Buchstabens, der mit der
              Systemschrift aus dem Kreis wachsen würde. */}
          <Icon name={all ? 'allDogs' : 'tag'} size={26} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
