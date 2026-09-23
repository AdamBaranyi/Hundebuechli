import { router } from 'expo-router';
import { useState } from 'react';

import { medicationsText } from '@/content/medications';
import { statesText } from '@/content/states';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import type { DogOption } from '@/ui/DogChooser';
import { FormScreen } from '@/ui/FormScreen';
import { Screen } from '@/ui/Screen';
import { EmptyState, LoadingState } from '@/ui/StateViews';
import { useToday } from '@/ui/useToday';

import { useDogList } from '../dogs/queries';
import {
  emptyMedicationForm,
  type MedicationFormErrors,
  medicationFormFrom,
  medicationInputFrom,
  type MedicationFormState,
} from './medication-form';
import { MedicationFormFields } from './MedicationFormFields';
import { useDeleteMedication, useMedication, useSaveMedication } from './queries';

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

type Props = { medicationId: string | null; dogId: string | null };

/** Medikament anlegen oder bearbeiten: lädt es, dann das Formular. */
export function MedicationFormScreen({ medicationId, dogId }: Props) {
  const today = useToday();
  const dogs = useDogList();
  const existing = useMedication(medicationId);

  if (dogs.isPending || (medicationId && existing.isPending)) {
    return (
      <Screen inModal>
        <LoadingState />
      </Screen>
    );
  }
  if (medicationId && !existing.data) {
    return (
      <Screen inModal>
        <EmptyState
          title={medicationsText.notFound}
          heading={1}
          action={{ label: medicationsText.cancel, onPress: close }}
        />
      </Screen>
    );
  }
  const options: DogOption[] = (dogs.data ?? []).map((dog) => ({
    id: dog.id,
    name: dog.name,
    photoUri: dog.photoUri,
  }));
  const onlyDog = options.length === 1 ? (options[0]?.id ?? null) : null;
  const initial = existing.data
    ? medicationFormFrom(existing.data)
    : emptyMedicationForm(dogId ?? onlyDog, today);
  return <MedicationForm medicationId={medicationId} initial={initial} dogs={options} />;
}

type FormProps = {
  medicationId: string | null;
  initial: MedicationFormState;
  dogs: DogOption[];
};

function MedicationForm({ medicationId, initial, dogs }: FormProps) {
  const save = useSaveMedication();
  const remove = useDeleteMedication();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<MedicationFormErrors>({});
  const [confirming, setConfirming] = useState(false);

  function change<K extends keyof MedicationFormState>(field: K, value: MedicationFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  function submit() {
    const result = medicationInputFrom(form);
    if (result.errors) {
      setErrors(result.errors);
      announce(Object.values(result.errors)[0] ?? '');
      return;
    }
    save.mutate(
      { id: medicationId, input: result.input },
      {
        onSuccess: () => {
          announce(medicationsText.saved);
          close();
        },
      },
    );
  }

  function confirmDelete() {
    if (!medicationId) return;
    setConfirming(false);
    remove.mutate(medicationId, {
      onSuccess: () => {
        announce(medicationsText.removed);
        close();
      },
    });
  }

  return (
    <FormScreen
      title={medicationId ? medicationsText.editTitle : medicationsText.newTitle}
      cancelLabel={medicationsText.cancel}
      onCancel={close}
      saveLabel={medicationsText.save}
      onSave={submit}
      saving={save.isPending}
      saveError={save.isError ? statesText.saveFailed : null}
    >
      <MedicationFormFields form={form} errors={errors} dogs={dogs} onChange={change} />
      {medicationId ? (
        <>
          <Button
            label={medicationsText.remove}
            variant="text"
            onPress={() => setConfirming(true)}
          />
          <ConfirmDialog
            visible={confirming}
            title={medicationsText.removeTitle}
            text={medicationsText.removeText}
            confirmLabel={medicationsText.remove}
            cancelLabel={medicationsText.cancel}
            onConfirm={confirmDelete}
            onCancel={() => setConfirming(false)}
          />
        </>
      ) : null}
    </FormScreen>
  );
}
