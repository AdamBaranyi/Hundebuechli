import { router } from 'expo-router';
import { useState } from 'react';

import { formatLocal, parseInputDate } from '@/content/format';
import { statesText } from '@/content/states';
import { validationMessage } from '@/content/validation';
import { weightsText } from '@/content/weights';
import { parseKilograms } from '@/domain/weight';
import { announce } from '@/ui/announce';
import { DateField } from '@/ui/DateField';
import { DogChooser, type DogOption } from '@/ui/DogChooser';
import { FormScreen } from '@/ui/FormScreen';
import { Screen } from '@/ui/Screen';
import { LoadingState } from '@/ui/StateViews';
import { TextField } from '@/ui/TextField';
import { useToday } from '@/ui/useToday';

import { useDogList } from '../dogs/queries';
import { useSaveWeight } from './queries';

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** Gewicht eintragen: für welchen Hund, wann, wie viel. */
export function WeightFormScreen({ dogId }: { dogId: string | null }) {
  const today = useToday();
  const dogs = useDogList();
  if (dogs.isPending) {
    return (
      <Screen inModal>
        <LoadingState />
      </Screen>
    );
  }
  const options: DogOption[] = (dogs.data ?? []).map((dog) => ({
    id: dog.id,
    name: dog.name,
    photoUri: dog.photoUri,
  }));
  const onlyDog = options.length === 1 ? (options[0]?.id ?? null) : null;
  return <WeightForm dogs={options} initialDogId={dogId ?? onlyDog} today={today} />;
}

type FormProps = { dogs: DogOption[]; initialDogId: string | null; today: string };

function WeightForm({ dogs, initialDogId, today }: FormProps) {
  const save = useSaveWeight();
  const [selectedDog, setSelectedDog] = useState(initialDogId);
  const [dateText, setDateText] = useState(formatLocal.input(today));
  const [weightText, setWeightText] = useState('');
  const [errors, setErrors] = useState<{ dogId?: string; date?: string; weight?: string }>({});

  function submit() {
    const date = parseInputDate(dateText);
    const grams = parseKilograms(weightText);
    const next: typeof errors = {};
    if (!selectedDog) next.dogId = validationMessage('dogId', 'required');
    if (!date) next.date = validationMessage('date', 'invalid_date');
    if (grams === null) next.weight = validationMessage('grams', 'weight_invalid');
    if (Object.keys(next).length > 0 || !date || grams === null || !selectedDog) {
      setErrors(next);
      announce(Object.values(next)[0] ?? '');
      return;
    }
    save.mutate(
      { dogId: selectedDog, date, grams },
      {
        onSuccess: () => {
          announce(weightsText.saved);
          close();
        },
      },
    );
  }

  return (
    <FormScreen
      title={weightsText.newTitle}
      cancelLabel={weightsText.cancel}
      onCancel={close}
      saveLabel={weightsText.save}
      onSave={submit}
      saving={save.isPending}
      saveError={save.isError ? statesText.saveFailed : null}
    >
      {dogs.length > 1 ? (
        <DogChooser
          label={weightsText.fields.dog}
          dogs={dogs}
          selected={selectedDog}
          onSelect={setSelectedDog}
        />
      ) : null}
      <DateField
        label={weightsText.fields.date}
        value={dateText}
        onChangeText={setDateText}
        error={errors.date ?? null}
      />
      <TextField
        label={weightsText.fields.weight}
        hint={weightsText.fields.weightHint}
        inputMode="decimal"
        keyboardType="decimal-pad"
        value={weightText}
        onChangeText={setWeightText}
        error={errors.weight ?? null}
      />
    </FormScreen>
  );
}
