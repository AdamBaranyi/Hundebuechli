import { formatDateInput } from './date-input';
import { TextField } from './TextField';

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
};

/** Feld für ein Datum: Ziffernblock, die Punkte kommen von selbst. */
export function DateField({ label, hint, value, onChangeText, error }: Props) {
  return (
    <TextField
      label={label}
      hint={hint}
      value={value}
      onChangeText={(text) => onChangeText(formatDateInput(text))}
      error={error}
      inputMode="numeric"
      keyboardType="number-pad"
      maxLength={10}
    />
  );
}
