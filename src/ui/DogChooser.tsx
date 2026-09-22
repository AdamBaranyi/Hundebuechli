import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { DogAvatar } from './DogAvatar';
import { space } from './tokens';

export type DogOption = { id: string; name: string; photoUri: string | null };

type Props = {
  label: string;
  dogs: readonly DogOption[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** Erster Eintrag «Alle», gewählt mit `null`. */
  allLabel?: string;
};

/** Hundewahl: runde Fotos mit Namen darunter, quer scrollbar. */
export function DogChooser({ label, dogs, selected, onSelect, allLabel }: Props) {
  const options = [
    ...(allLabel ? [{ id: null, name: allLabel, photoUri: null, all: true }] : []),
    ...dogs.map((dog) => ({ ...dog, all: false })),
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      role="radiogroup"
      accessibilityLabel={label}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const isSelected = option.id === selected;
        return (
          <Pressable
            key={option.id ?? 'alle'}
            role="radio"
            accessibilityLabel={option.name}
            accessibilityState={{ checked: isSelected }}
            aria-checked={isSelected}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [styles.option, { opacity: pressed ? 0.8 : 1 }]}
          >
            <DogAvatar uri={option.photoUri} all={option.all} selected={isSelected} />
            <AppText
              variant="secondary"
              weight={isSelected ? 'bold' : 'regular'}
              color={isSelected ? 'graphite' : 'pencil'}
              style={styles.name}
            >
              {option.name}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.s4, paddingVertical: space.s1, paddingHorizontal: 2 },
  option: { alignItems: 'center', gap: 6, minWidth: 64, maxWidth: 96, minHeight: 48 },
  name: { textAlign: 'center' },
});
