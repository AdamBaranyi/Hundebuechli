import { StyleSheet, View } from 'react-native';

import { medicationsText } from '@/content/medications';
import { AppText } from '@/ui/AppText';
import { DateField } from '@/ui/DateField';
import { DogChooser, type DogOption } from '@/ui/DogChooser';
import { SwitchRow } from '@/ui/SwitchRow';
import { TextField } from '@/ui/TextField';
import { space } from '@/ui/tokens';

import type { MedicationFormErrors, MedicationFormState } from './medication-form';
import { TimeChoice } from './TimeChoice';

type Props = {
  form: MedicationFormState;
  errors: MedicationFormErrors;
  dogs: readonly DogOption[];
  onChange: <K extends keyof MedicationFormState>(field: K, value: MedicationFormState[K]) => void;
};

const f = medicationsText.fields;

function Group({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <AppText variant="secondary" weight="medium" color="pencil">
        {label}
      </AppText>
      {hint ? (
        <AppText variant="secondary" color="pencil">
          {hint}
        </AppText>
      ) : null}
      {children}
      {error ? (
        <AppText variant="secondary" weight="bold" color="carmine" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

/** Die Felder eines Medikaments: für wen, was, wie viel, wann, wie lange. */
export function MedicationFormFields({ form, errors, dogs, onChange }: Props) {
  return (
    <>
      {dogs.length > 1 ? (
        <Group label={f.dog} error={errors.dogId}>
          <DogChooser
            label={f.dog}
            dogs={dogs}
            selected={form.dogId}
            onSelect={(id) => onChange('dogId', id)}
          />
        </Group>
      ) : null}
      <TextField
        label={f.name}
        hint={f.nameHint}
        value={form.name}
        onChangeText={(value) => onChange('name', value)}
        error={errors.name ?? null}
      />
      <TextField
        label={f.dose}
        hint={f.doseHint}
        value={form.dose}
        onChangeText={(value) => onChange('dose', value)}
        error={errors.dose ?? null}
      />
      <Group label={f.times} hint={f.timesHint} error={errors.times}>
        <TimeChoice times={form.times} onChange={(times) => onChange('times', times)} />
      </Group>
      <DateField
        label={f.start}
        value={form.startText}
        onChangeText={(value) => onChange('startText', value)}
        error={errors.startDate ?? null}
      />
      <DateField
        label={f.end}
        hint={f.endHint}
        value={form.endText}
        onChangeText={(value) => onChange('endText', value)}
        error={errors.endDate ?? null}
      />
      <SwitchRow
        label={f.active}
        value={form.active}
        onChange={(value) => onChange('active', value)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.s2 },
});
