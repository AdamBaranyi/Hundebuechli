import { router } from 'expo-router';
import { useState } from 'react';

import { healthText } from '@/content/health';
import { statesText } from '@/content/states';
import type { HealthKind } from '@/domain/health';
import type { DogOption } from '@/ui/DogChooser';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { FormScreen } from '@/ui/FormScreen';
import { Screen } from '@/ui/Screen';
import { EmptyState, LoadingState } from '@/ui/StateViews';
import { useToday } from '@/ui/useToday';

import { useDogList } from '../dogs/queries';
import {
  emptyHealthForm,
  type HealthFormErrors,
  healthFormFrom,
  type HealthFormState,
  healthInputFrom,
} from './health-form';
import { HealthFormFields } from './HealthFormFields';
import {
  useDeleteHealthEntry,
  useHealthEntry,
  useRecentProducts,
  useSaveHealthEntry,
} from './queries';

type Props = { entryId: string | null; dogId: string | null; kind: HealthKind | null };

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Eintrag erfassen oder bearbeiten: lädt Hunde und Eintrag, dann das Formular. */
export function HealthFormScreen({ entryId, dogId, kind }: Props) {
  const today = useToday();
  const dogs = useDogList();
  const existing = useHealthEntry(entryId);

  if (dogs.isPending || (entryId && existing.isPending)) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (entryId && !existing.data) {
    return (
      <Screen>
        <EmptyState
          title={healthText.notFound}
          heading={1}
          action={{ label: healthText.cancel, onPress: close }}
        />
      </Screen>
    );
  }
  const options: DogOption[] = (dogs.data ?? []).map((dog) => ({
    id: dog.id,
    name: dog.name,
    photoUri: dog.photoUri,
  }));
  // Mit nur einem Hund ist die Wahl klar.
  const onlyDog = options.length === 1 ? (options[0]?.id ?? null) : null;
  const initial = existing.data
    ? healthFormFrom(existing.data, today)
    : emptyHealthForm(dogId ?? onlyDog, kind);
  return <HealthForm entryId={entryId} initial={initial} dogs={options} />;
}

type FormProps = { entryId: string | null; initial: HealthFormState; dogs: DogOption[] };

/** Das Formular selbst, als Blatt von unten. */
function HealthForm({ entryId, initial, dogs }: FormProps) {
  const today = useToday();
  const save = useSaveHealthEntry();
  const remove = useDeleteHealthEntry();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<HealthFormErrors>({});
  const [confirming, setConfirming] = useState(false);
  const recent = useRecentProducts(form.dogId, form.kind);

  function change<K extends keyof HealthFormState>(field: K, value: HealthFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  function submit() {
    const result = healthInputFrom(form, today);
    if (result.errors) {
      setErrors(result.errors);
      announce(Object.values(result.errors)[0] ?? '');
      return;
    }
    save.mutate(
      { id: entryId, input: result.input },
      {
        onSuccess: () => {
          announce(healthText.saved);
          close();
        },
      },
    );
  }

  function confirmDelete() {
    if (!entryId) return;
    setConfirming(false);
    remove.mutate(entryId, {
      onSuccess: () => {
        announce(healthText.removed);
        close();
      },
    });
  }

  return (
    <FormScreen
      title={entryId ? healthText.editTitle : healthText.newTitle}
      cancelLabel={healthText.cancel}
      onCancel={close}
      saveLabel={healthText.save}
      onSave={submit}
      saving={save.isPending}
      saveError={save.isError ? statesText.saveFailed : null}
    >
      <HealthFormFields
        form={form}
        errors={errors}
        dogs={dogs}
        recent={recent.data ?? []}
        today={today}
        onChange={change}
      />
      {entryId ? (
        <>
          <Button label={healthText.remove} variant="text" onPress={() => setConfirming(true)} />
          <ConfirmDialog
            visible={confirming}
            title={healthText.removeTitle}
            text={healthText.removeText}
            confirmLabel={healthText.remove}
            cancelLabel={healthText.cancel}
            onConfirm={confirmDelete}
            onCancel={() => setConfirming(false)}
          />
        </>
      ) : null}
    </FormScreen>
  );
}
