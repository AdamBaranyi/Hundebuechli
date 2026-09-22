import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { usePalette } from './theme';
import { radius, space, touch } from './tokens';

export type Choice<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  /** Beschriftung der Gruppe, für VoiceOver. */
  label: string;
  choices: readonly Choice<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
};

/**
 * Kapseln zur Auswahl, eine davon gewählt: Graphit gefüllt mit Haken. Für
 * VoiceOver eine Gruppe von Optionsfeldern; 48 Punkte hoch.
 */
export function ChoiceChips<T extends string>({ label, choices, selected, onSelect }: Props<T>) {
  const palette = usePalette();
  return (
    <View role="radiogroup" accessibilityLabel={label} style={styles.chips}>
      {choices.map((choice) => {
        const isSelected = choice.value === selected;
        return (
          <Pressable
            key={choice.value}
            role="radio"
            accessibilityLabel={choice.label}
            accessibilityState={{ checked: isSelected }}
            aria-checked={isSelected}
            onPress={() => onSelect(choice.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                borderColor: isSelected ? palette.graphite : palette.fieldBorder,
                backgroundColor: isSelected
                  ? palette.graphite
                  : pressed
                    ? palette.pressed
                    : palette.sheet,
              },
            ]}
          >
            {isSelected ? <Icon name="check" size={18} color="onGraphite" /> : null}
            <AppText
              variant="secondary"
              weight="medium"
              color={isSelected ? 'onGraphite' : 'graphite'}
            >
              {choice.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: touch.min,
    paddingHorizontal: space.s4,
    paddingVertical: space.s2,
    borderWidth: 1.5,
    borderRadius: radius.capsule,
  },
});
