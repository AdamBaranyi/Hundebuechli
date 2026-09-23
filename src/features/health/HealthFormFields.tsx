import { StyleSheet, View } from 'react-native';

import { formatLocal } from '@/content/format';
import { healthKinds, healthText } from '@/content/health';
import { HEALTH_KINDS, REPEAT_CHOICES } from '@/domain/health';
import type { LocalDate } from '@/domain/local-date';
import { AppText } from '@/ui/AppText';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { ChoiceTiles } from '@/ui/ChoiceTiles';
import { DateField } from '@/ui/DateField';
import { DogChooser, type DogOption } from '@/ui/DogChooser';
import { usePalette } from '@/ui/theme';
import { TextField } from '@/ui/TextField';
import { radius, space } from '@/ui/tokens';

import {
  type DueChoice,
  entryDate,
  type HealthFormErrors,
  type HealthFormState,
  nextDue,
} from './health-form';
import { kindIcons } from './kind-icons';

type Props = {
  form: HealthFormState;
  errors: HealthFormErrors;
  dogs: readonly DogOption[];
  recent: readonly string[];
  today: LocalDate;
  onChange: <K extends keyof HealthFormState>(field: K, value: HealthFormState[K]) => void;
};

const f = healthText.fields;

function Group({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <AppText variant="secondary" weight="medium" color="pencil">
        {label}
      </AppText>
      {children}
      {error ? (
        <AppText variant="secondary" weight="bold" color="carmine" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

/** Die Felder eines Eintrags: für wen, welche Art, wann, womit, wann wieder. */
export function HealthFormFields({ form, errors, dogs, recent, today, onChange }: Props) {
  const palette = usePalette();
  const date = entryDate(form, today);
  const due = nextDue(form, date);
  const dueChoices: { value: DueChoice; label: string }[] = [
    { value: 'none', label: healthText.dueChoices.none },
    ...REPEAT_CHOICES.map((months) => ({
      value: String(months) as DueChoice,
      label: healthText.dueChoices.months(months),
    })),
    { value: 'date', label: healthText.dueChoices.date },
  ];
  return (
    <>
      <Group label={f.dog} error={errors.dogId}>
        <DogChooser
          label={f.dog}
          dogs={dogs}
          selected={form.dogId}
          onSelect={(id) => onChange('dogId', id)}
        />
      </Group>
      <Group label={f.kind} error={errors.kind}>
        <ChoiceTiles
          label={f.kind}
          tiles={HEALTH_KINDS.map((kind) => ({
            value: kind,
            label: healthKinds[kind],
            icon: kindIcons[kind],
          }))}
          selected={form.kind}
          onSelect={(kind) => onChange('kind', kind)}
        />
      </Group>
      <Group label={f.date}>
        <ChoiceChips
          label={f.date}
          choices={[
            { value: 'today', label: healthText.dateChoices.today },
            { value: 'yesterday', label: healthText.dateChoices.yesterday },
            { value: 'other', label: healthText.dateChoices.other },
          ]}
          selected={form.dateChoice}
          onSelect={(choice) => onChange('dateChoice', choice)}
        />
        {form.dateChoice === 'other' ? (
          <DateField
            label={f.otherDate}
            hint={formatLocal.input(today)}
            value={form.dateText}
            onChangeText={(value) => onChange('dateText', value)}
            error={errors.date ?? null}
          />
        ) : null}
      </Group>
      <TextField
        label={f.product}
        value={form.product}
        onChangeText={(value) => onChange('product', value)}
        error={errors.product ?? null}
      />
      {recent.length > 0 ? (
        <Group label={f.recent}>
          <ChoiceChips
            label={f.recent}
            choices={recent.map((product) => ({ value: product, label: product }))}
            selected={form.product}
            onSelect={(product) => onChange('product', product)}
          />
        </Group>
      ) : null}
      <Group label={f.nextDue} error={form.dueChoice === 'date' ? undefined : errors.due}>
        <ChoiceChips
          label={f.nextDue}
          choices={dueChoices}
          selected={form.dueChoice}
          onSelect={(choice) => onChange('dueChoice', choice)}
        />
        {form.dueChoice === 'date' ? (
          <DateField
            label={f.nextDueDate}
            hint={formatLocal.input(today)}
            value={form.dueText}
            onChangeText={(value) => onChange('dueText', value)}
            error={errors.due ?? null}
          />
        ) : null}
        <View style={[styles.result, { backgroundColor: palette.sheet }]} aria-live="polite">
          <AppText weight="bold">
            {due.nextDueDate
              ? healthText.nextDueResult(formatLocal.full(due.nextDueDate))
              : healthText.noNextDue}
          </AppText>
        </View>
      </Group>
      <TextField
        label={f.note}
        placeholder={f.notePlaceholder}
        multiline
        value={form.note}
        onChangeText={(value) => onChange('note', value)}
        error={errors.note ?? null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.s3 },
  result: { padding: space.s4, borderRadius: radius.field },
});
