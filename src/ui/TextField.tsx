import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { usePalette } from './theme';
import { fontFamily, radius, space, typeScale } from './tokens';

type Props = Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'keyboardType'
  | 'autoComplete'
  | 'autoCapitalize'
  | 'inputMode'
  | 'maxLength'
  | 'multiline'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'textContentType'
> & {
  label: string;
  /** Kurzer Hinweis unter der Beschriftung, etwa das Format eines Datums. */
  hint?: string;
  /** Fehlertext; das Feld bekommt dann einen Karmin-Rand und ein Zeichen. */
  error?: string | null;
  /** Zusatz unter dem Feld, etwa «Chipnummer aus der Schweiz». */
  note?: string | null;
  /** Läuft, wenn das Feld den Fokus verliert – etwa um den Wert zu übernehmen. */
  onEndEditing?: () => void;
};

/**
 * Eingabefeld nach Entwurf: Beschriftung darüber, Feld 52 hoch, Kante in
 * Feldrand, Fokus mit 2 Punkten Graphit. Ein Fehler steht als Satz darunter,
 * nicht nur als Farbe, und wird mit dem Feld vorgelesen.
 */
export function TextField({ label, hint, error, note, multiline, onEndEditing, ...input }: Props) {
  const palette = usePalette();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? palette.carmine : focused ? palette.graphite : palette.fieldBorder;
  return (
    <View style={styles.field}>
      <AppText variant="secondary" weight="medium" color="pencil">
        {label}
      </AppText>
      {hint ? (
        <AppText variant="secondary" color="pencil">
          {hint}
        </AppText>
      ) : null}
      <TextInput
        {...input}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={[hint, error].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onEndEditing?.();
        }}
        placeholderTextColor={palette.pencil}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          {
            color: palette.graphite,
            backgroundColor: palette.sheet,
            borderColor,
            borderWidth: error || focused ? 2 : 1.5,
          },
          // Fokus nach Entwurf: 2 Punkte Graphit mit 2 Punkten Abstand.
          focused
            ? {
                outlineWidth: 2,
                outlineStyle: 'solid',
                outlineColor: palette.graphite,
                outlineOffset: 2,
              }
            : null,
        ]}
      />
      {error ? (
        <View style={styles.error} role="alert" accessible>
          <Icon name="alert" size={18} color="carmine" />
          <AppText variant="secondary" weight="bold" color="carmine" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : note ? (
        <AppText variant="secondary" color="pencil">
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: space.s3,
    borderRadius: radius.field,
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body.fontSize,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  errorText: { flex: 1 },
});
