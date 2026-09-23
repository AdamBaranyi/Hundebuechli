import { useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import { dogsText } from '@/content/dogs';
import { UnsafePhotoError } from '@/photos/import-photo';
import { pickPhoto, type PhotoSource } from '@/photos/pick';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { space } from '@/ui/tokens';

import { type DogWithPhoto, useSetDogPhoto } from './queries';

type Problem = 'unsafe' | 'failed' | 'denied' | null;

/**
 * Foto aufnehmen, wählen oder ersetzen. Das Foto selbst zeigt DogHero oben im
 * Profil; ohne Foto stehen diese Knöpfe oben, mit Foto weiter unten.
 * Gespeichert wird ohne Metadaten und erst nach der Prüfung. Im Browser wird
 * die Kamera zur Dateiauswahl, darum gibt es dort nur «Foto wählen».
 */
export function DogPhotoPanel({ dog }: { dog: DogWithPhoto }) {
  const setPhoto = useSetDogPhoto();
  const [problem, setProblem] = useState<Problem>(null);

  async function choose(source: PhotoSource) {
    setProblem(null);
    const picked = await pickPhoto(source);
    if (picked.status === 'denied') return setProblem('denied');
    if (picked.status !== 'picked') return;
    setPhoto.mutate(
      { dogId: dog.id, image: picked.image },
      {
        onError: (error) => {
          const next = error instanceof UnsafePhotoError ? 'unsafe' : 'failed';
          setProblem(next);
          announce(dogsText.photo[next]);
        },
      },
    );
  }

  const sources: PhotoSource[] = Platform.OS === 'web' ? ['library'] : ['camera', 'library'];
  return (
    <View style={styles.panel}>
      {setPhoto.isPending ? (
        <AppText variant="secondary" color="pencil" role="status">
          {dogsText.photo.busy}
        </AppText>
      ) : null}
      {problem ? (
        <View style={styles.problem} role="alert">
          <AppText variant="secondary" weight="bold" color="carmine">
            {dogsText.photo[problem]}
          </AppText>
          {problem === 'denied' ? (
            <Button
              label={dogsText.photo.openSettings}
              variant="text"
              onPress={() => void Linking.openSettings()}
            />
          ) : null}
        </View>
      ) : null}
      <View style={styles.buttons}>
        {sources.map((source) => (
          <View key={source} style={styles.button}>
            <Button
              label={
                source === 'camera'
                  ? dogsText.photo.take
                  : dog.photoUri
                    ? dogsText.photo.replace
                    : dogsText.photo.choose
              }
              variant="secondary"
              icon={source === 'camera' ? 'camera' : undefined}
              disabled={setPhoto.isPending}
              onPress={() => void choose(source)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: space.s3 },
  problem: { gap: space.s2 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  button: { flexGrow: 1, flexBasis: 160 },
});
