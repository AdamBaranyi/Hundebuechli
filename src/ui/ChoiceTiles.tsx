import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import type { IconName } from './icon-shapes';
import { usePalette } from './theme';
import { radius, space } from './tokens';

export type Tile<T extends string> = { value: T; label: string; icon: IconName };

type Props<T extends string> = {
  label: string;
  tiles: readonly Tile<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
};

/**
 * Vier gleichrangige Möglichkeiten als Kacheln, zwei je Zeile (Art des
 * Eintrags). Gewählt mit Kante in Graphit; für VoiceOver Optionsfelder.
 */
export function ChoiceTiles<T extends string>({ label, tiles, selected, onSelect }: Props<T>) {
  const palette = usePalette();
  return (
    <View role="radiogroup" accessibilityLabel={label} style={styles.tiles}>
      {tiles.map((tile) => {
        const isSelected = tile.value === selected;
        return (
          <Pressable
            key={tile.value}
            role="radio"
            accessibilityLabel={tile.label}
            accessibilityState={{ checked: isSelected }}
            aria-checked={isSelected}
            onPress={() => onSelect(tile.value)}
            style={({ pressed }) => [
              styles.tile,
              {
                borderColor: isSelected ? palette.graphite : palette.sheet,
                backgroundColor: pressed ? palette.pressed : palette.sheet,
              },
            ]}
          >
            <Icon name={tile.icon} size={26} />
            <AppText weight="bold">{tile.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 88,
    gap: space.s2,
    paddingVertical: space.s3,
    paddingHorizontal: space.s4,
    borderWidth: 2,
    borderRadius: radius.field,
  },
});
