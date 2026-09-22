import { router } from 'expo-router';
import { useState } from 'react';

import { dogsText } from '@/content/dogs';
import { statesText } from '@/content/states';
import { announce } from '@/ui/announce';
import { FormScreen } from '@/ui/FormScreen';
import { Screen } from '@/ui/Screen';
import { EmptyState, LoadingState } from '@/ui/StateViews';

import {
  type DogFormErrors,
  dogFormFrom,
  dogInputFrom,
  type DogFormState,
  emptyDogForm,
} from './dog-form';
import { DogFormFields } from './DogFormFields';
import { useDog, useSaveDog } from './queries';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Hund anlegen oder bearbeiten: lädt den Hund, dann das Formular mit seinen Werten. */
export function DogFormScreen({ dogId }: { dogId: string | null }) {
  const existing = useDog(dogId);
  if (dogId && existing.isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (dogId && !existing.data) {
    return (
      <Screen>
        <EmptyState
          title={dogsText.notFound}
          heading={1}
          action={{ label: dogsText.cancel, onPress: close }}
        />
      </Screen>
    );
  }
  const initial = existing.data ? dogFormFrom(existing.data) : emptyDogForm();
  return <DogForm dogId={dogId} initial={initial} />;
}

/** Das Formular selbst. Gespeichert wird beim Sichern, dann sofort. */
function DogForm({ dogId, initial }: { dogId: string | null; initial: DogFormState }) {
  const save = useSaveDog();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<DogFormErrors>({});

  function change<K extends keyof DogFormState>(field: K, value: DogFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit() {
    const result = dogInputFrom(form);
    if (result.errors) {
      setErrors(result.errors);
      announce(Object.values(result.errors)[0] ?? '');
      return;
    }
    save.mutate(
      { id: dogId, input: result.input },
      {
        onSuccess: (dog) => {
          announce(dogsText.saved(dog.name));
          if (dogId) close();
          // Mit Anker: Unter dem Profil liegt die Liste, «Zurück» führt dorthin.
          else
            router.replace(
              { pathname: '/dogs/[id]', params: { id: dog.id } },
              { withAnchor: true },
            );
        },
      },
    );
  }

  return (
    <FormScreen
      title={dogId ? dogsText.editTitle : dogsText.newTitle}
      cancelLabel={dogsText.cancel}
      onCancel={close}
      saveLabel={dogsText.save}
      onSave={submit}
      saving={save.isPending}
      saveError={save.isError ? statesText.saveFailed : null}
    >
      <DogFormFields form={form} errors={errors} onChange={change} />
    </FormScreen>
  );
}
