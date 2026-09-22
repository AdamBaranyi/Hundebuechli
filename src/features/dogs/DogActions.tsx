import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { dogsText } from '@/content/dogs';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { space } from '@/ui/tokens';

import { type DogWithPhoto, useDeleteDog, useDogData, useSetDogArchived } from './queries';

/**
 * Bearbeiten, archivieren, löschen. Archivieren ist der ruhige Weg, wenn ein
 * Hund nicht mehr da ist; die App fragt nicht nach dem Grund. Löschen fragt
 * nach und nennt, was verschwindet.
 */
export function DogActions({ dog }: { dog: DogWithPhoto }) {
  const data = useDogData(dog.id);
  const archive = useSetDogArchived();
  const remove = useDeleteDog();
  const [confirming, setConfirming] = useState(false);
  const archived = dog.archivedAt !== null;

  function confirmDelete() {
    setConfirming(false);
    remove.mutate(dog.id, {
      onSuccess: () => {
        announce(dogsText.remove.done(dog.name));
        // Das Profil gibt es nicht mehr: an seine Stelle tritt die Liste.
        router.replace('/dogs');
      },
    });
  }

  return (
    <View style={{ gap: space.s2 }}>
      <Button
        label={dogsText.profile.edit}
        variant="secondary"
        onPress={() => router.push({ pathname: '/edit-dog/[id]', params: { id: dog.id } })}
      />
      <Button
        label={archived ? dogsText.profile.unarchive : dogsText.profile.archive}
        variant="text"
        onPress={() => archive.mutate({ id: dog.id, archived: !archived })}
      />
      <Button label={dogsText.profile.remove} variant="text" onPress={() => setConfirming(true)} />
      <ConfirmDialog
        visible={confirming}
        title={dogsText.remove.title(dog.name)}
        text={dogsText.remove.text(dog.name, data.data?.entries ?? 0, data.data?.photos ?? 0)}
        confirmLabel={dogsText.remove.confirm(dog.name)}
        cancelLabel={dogsText.cancel}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}
