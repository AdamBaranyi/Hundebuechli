import { useState } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { photosText } from '@/content/photos';
import type { AttachmentParent } from '@/db/repositories/attachments';
import { UnsafePhotoError } from '@/photos/import-photo';
import { pickPhoto, type PhotoSource } from '@/photos/pick';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { usePalette } from '@/ui/theme';
import { radius, space, touch } from '@/ui/tokens';

import { useAddPhoto, useRemovePhoto } from './queries';

type Problem = 'unsafe' | 'failed' | 'denied' | null;

export type PhotoView = { id: string; uri: string };

const t = photosText;

type Props = {
  parent: AttachmentParent;
  photos: readonly PhotoView[];
  /** Tippen aufs Bild öffnet es gross, etwa bei Dokumenten. */
  onOpen?: (photo: PhotoView) => void;
};

/**
 * Fotos eines Tagebucheintrags oder Dokuments. Wie beim Hund wird erst
 * gespeichert, wenn der Eintrag schon steht – so bleibt keine Datei ohne
 * Eintrag zurück. Jedes Foto geht durch dieselbe Prüfung auf Standortdaten.
 */
export function AttachedPhotos({ parent, photos, onOpen }: Props) {
  const palette = usePalette();
  const add = useAddPhoto();
  const remove = useRemovePhoto();
  const [problem, setProblem] = useState<Problem>(null);

  async function choose(source: PhotoSource) {
    setProblem(null);
    const picked = await pickPhoto(source);
    if (picked.status === 'denied') return setProblem('denied');
    if (picked.status !== 'picked') return;
    add.mutate(
      { parent, image: picked.image },
      {
        onError: (error) => {
          const next = error instanceof UnsafePhotoError ? 'unsafe' : 'failed';
          setProblem(next);
          announce(t[next]);
        },
      },
    );
  }

  const sources: PhotoSource[] = Platform.OS === 'web' ? ['library'] : ['camera', 'library'];
  return (
    <View style={styles.panel}>
      <AppText variant="secondary" weight="medium" color="pencil">
        {t.title}
      </AppText>
      {photos.length > 0 ? (
        <View style={styles.grid}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.item}>
              <Pressable
                role={onOpen ? 'button' : undefined}
                accessibilityLabel={
                  onOpen ? t.open(index + 1, photos.length) : t.label(index + 1, photos.length)
                }
                disabled={!onOpen}
                onPress={() => onOpen?.(photo)}
              >
                <Image
                  source={{ uri: photo.uri }}
                  accessibilityLabel={t.label(index + 1, photos.length)}
                  accessibilityRole="image"
                  style={[styles.photo, { backgroundColor: palette.line }]}
                  resizeMode="cover"
                />
              </Pressable>
              <Pressable
                role="button"
                accessibilityLabel={t.remove(index + 1)}
                onPress={() => remove.mutate(photo.id, { onSuccess: () => announce(t.removed) })}
                style={({ pressed }) => [
                  styles.remove,
                  { backgroundColor: pressed ? palette.pressed : palette.sheet },
                ]}
              >
                <Icon name="trash" size={22} color="pencil" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      {add.isPending ? (
        <AppText variant="secondary" color="pencil" role="status">
          {t.busy}
        </AppText>
      ) : null}
      {problem ? (
        <View style={styles.problem} role="alert">
          <AppText variant="secondary" weight="bold" color="carmine">
            {t[problem]}
          </AppText>
          {problem === 'denied' ? (
            <Button
              label={t.openSettings}
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
              label={source === 'camera' ? t.take : t.add}
              variant="secondary"
              icon={source === 'camera' ? 'camera' : undefined}
              disabled={add.isPending}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s3 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  photo: { width: 96, height: 96, borderRadius: radius.field },
  remove: {
    width: touch.min,
    height: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.field,
  },
  problem: { gap: space.s2 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  button: { flexGrow: 1, flexBasis: 160 },
});
