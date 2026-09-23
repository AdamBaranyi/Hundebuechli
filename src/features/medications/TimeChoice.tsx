import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatLocal } from '@/content/format';
import { medicationsText } from '@/content/medications';
import { TIME_CHOICES } from '@/domain/medication';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { usePalette } from '@/ui/theme';
import { TextField } from '@/ui/TextField';
import { radius, space, touch } from '@/ui/tokens';

import { parseTime, toggleTime } from './medication-form';

type Props = {
  times: readonly number[];
  onChange: (times: number[]) => void;
};

const f = medicationsText.fields;

/**
 * Die Uhrzeiten eines Medikaments: Vorschläge zum Antippen, dazu ein Feld für
 * jede andere Zeit. Mehrere sind möglich, darum Kästchen statt Optionsfelder.
 */
export function TimeChoice({ times, onChange }: Props) {
  const palette = usePalette();
  const [text, setText] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const shown = [...new Set([...TIME_CHOICES, ...times])].sort((a, b) => a - b);

  function add() {
    const minute = parseTime(text);
    if (minute === null) {
      setProblem(medicationsText.fields.otherTimeError);
      return;
    }
    setProblem(null);
    setText('');
    if (!times.includes(minute)) onChange(toggleTime(times, minute));
  }

  return (
    <View style={styles.group}>
      <View role="group" accessibilityLabel={f.times} style={styles.chips}>
        {shown.map((minute) => {
          const selected = times.includes(minute);
          const label = formatLocal.time(minute);
          return (
            <Pressable
              key={minute}
              role="checkbox"
              accessibilityLabel={label}
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              onPress={() => onChange(toggleTime(times, minute))}
              style={({ pressed }) => [
                styles.chip,
                {
                  borderColor: selected ? palette.graphite : palette.fieldBorder,
                  backgroundColor: selected
                    ? palette.graphite
                    : pressed
                      ? palette.pressed
                      : 'transparent',
                },
              ]}
            >
              {selected ? <Icon name="check" size={20} color="onGraphite" /> : null}
              <AppText color={selected ? 'onGraphite' : 'graphite'} weight="medium">
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.other}>
        <View style={styles.field}>
          <TextField
            label={f.otherTime}
            hint="18:30"
            inputMode="numeric"
            keyboardType="numbers-and-punctuation"
            value={text}
            onChangeText={(value) => {
              setText(value);
              setProblem(null);
            }}
            error={problem}
          />
        </View>
        <Button label={f.addTime} variant="secondary" icon="plus" onPress={add} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.s3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    minHeight: touch.min,
    paddingHorizontal: space.s4,
    borderWidth: 1.5,
    borderRadius: radius.capsule,
  },
  other: { gap: space.s2 },
  field: { flexGrow: 1 },
});
