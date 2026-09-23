import { formatTimeInput } from './time-input';
import { TextField } from './TextField';

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (value: string) => void;
  onEndEditing?: () => void;
  error?: string | null;
};

/** Feld für eine Uhrzeit: Ziffernblock, der Doppelpunkt kommt von selbst. */
export function TimeField({ label, hint, value, onChangeText, onEndEditing, error }: Props) {
  return (
    <TextField
      label={label}
      hint={hint}
      value={value}
      onChangeText={(text) => onChangeText(formatTimeInput(text))}
      onEndEditing={onEndEditing}
      error={error}
      inputMode="numeric"
      keyboardType="number-pad"
      maxLength={5}
    />
  );
}
