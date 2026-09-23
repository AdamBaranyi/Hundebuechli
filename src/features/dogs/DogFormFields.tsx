import { View } from 'react-native';

import { dogsText } from '@/content/dogs';
import { chipCountryCode, isValidChipNumber, normalizeChipNumber } from '@/domain/chip';
import { AppText } from '@/ui/AppText';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { DateField } from '@/ui/DateField';
import { SectionTitle } from '@/ui/SectionTitle';
import { SwitchRow } from '@/ui/SwitchRow';
import { TextField } from '@/ui/TextField';
import { space } from '@/ui/tokens';

import type { DogFormErrors, DogFormState } from './dog-form';

type Props = {
  form: DogFormState;
  errors: DogFormErrors;
  onChange: <K extends keyof DogFormState>(field: K, value: DogFormState[K]) => void;
};

const f = dogsText.fields;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.s4 }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </View>
  );
}

function chipNote(value: string): string | null {
  const chip = normalizeChipNumber(value);
  return isValidChipNumber(chip) && chipCountryCode(chip) === 'CH' ? dogsText.chipCountry.CH : null;
}

/** Die Felder des Hundes in fünf Abschnitten; nur der Name ist Pflicht. */
export function DogFormFields({ form, errors, onChange }: Props) {
  const text = (field: keyof DogFormState & string) => ({
    value: String(form[field] ?? ''),
    onChangeText: (value: string) => onChange(field, value as never),
    error: errors[field] ?? null,
  });
  return (
    <>
      <Section title={dogsText.sections.about}>
        <TextField label={f.name} autoComplete="off" {...text('name')} />
        <TextField label={f.breed} {...text('breed')} />
        <AppText variant="secondary" weight="medium" color="pencil">
          {f.sex}
        </AppText>
        <ChoiceChips
          label={f.sex}
          choices={[
            { value: 'male', label: dogsText.sex.male },
            { value: 'female', label: dogsText.sex.female },
          ]}
          selected={form.sex}
          onSelect={(value) => onChange('sex', form.sex === value ? null : value)}
        />
        <SwitchRow
          label={f.neutered}
          value={form.neutered}
          onChange={(value) => onChange('neutered', value)}
        />
        <DateField label={f.birthDate} hint={f.birthDateHint} {...text('birthDate')} />
        <TextField
          label={f.birthYear}
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={4}
          {...text('birthYear')}
        />
        <TextField label={f.colorMarkings} {...text('colorMarkings')} />
      </Section>
      <Section title={dogsText.sections.chip}>
        <TextField
          label={f.chipNumber}
          inputMode="numeric"
          note={chipNote(form.chipNumber)}
          {...text('chipNumber')}
        />
        <SwitchRow
          label={f.amicusRegistered}
          value={form.amicusRegistered}
          onChange={(value) => onChange('amicusRegistered', value)}
        />
      </Section>
      <Section title={dogsText.sections.vet}>
        <TextField label={f.vetName} {...text('vetName')} />
        <TextField
          label={f.vetPhone}
          inputMode="tel"
          keyboardType="phone-pad"
          {...text('vetPhone')}
        />
        <TextField label={f.vetAddress} multiline {...text('vetAddress')} />
      </Section>
      <Section title={dogsText.sections.insurance}>
        <TextField label={f.insuranceName} {...text('insuranceName')} />
        <TextField label={f.insurancePolicy} {...text('insurancePolicy')} />
        <TextField
          label={f.insurancePhone}
          inputMode="tel"
          keyboardType="phone-pad"
          {...text('insurancePhone')}
        />
      </Section>
      <Section title={dogsText.sections.care}>
        <TextField label={f.food} multiline {...text('food')} />
        <TextField label={f.allergies} multiline {...text('allergies')} />
        <TextField label={f.careNotes} multiline {...text('careNotes')} />
      </Section>
    </>
  );
}
