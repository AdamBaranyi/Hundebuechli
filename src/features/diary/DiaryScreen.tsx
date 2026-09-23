import { router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { diaryCategories, diaryText } from '@/content/diary';
import { photosText } from '@/content/photos';
import { formatLocal } from '@/content/format';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Row } from '@/ui/Row';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { usePalette } from '@/ui/theme';
import { radius, space } from '@/ui/tokens';

import { useDog } from '../dogs/queries';
import { useDiaryEntries } from './queries';

/** Das Tagebuch eines Hundes: der neuste Eintrag oben, mit seinen Fotos. */
export function DiaryScreen({ dogId }: { dogId: string | null }) {
  const palette = usePalette();
  const dog = useDog(dogId);
  const entries = useDiaryEntries(dogId ?? '');
  const list = entries.data ?? [];

  return (
    <Screen withHeader inTabs>
      <View style={{ gap: space.s1 }}>
        <AppText variant="largeTitle" heading={1}>
          {diaryText.title}
        </AppText>
        {dog.data ? <AppText color="pencil">{dog.data.name}</AppText> : null}
      </View>
      {entries.isPending ? <LoadingState /> : null}
      {entries.isError ? <ErrorState onRetry={() => void entries.refetch()} /> : null}
      {entries.isSuccess && list.length === 0 ? (
        <EmptyState title={diaryText.empty} text={diaryText.emptyText} />
      ) : null}
      {list.map((entry) => (
        <View key={entry.id} style={{ gap: space.s2 }}>
          <Sheet>
            <Row
              icon="notebook"
              title={diaryCategories[entry.category]}
              secondary={diaryText.rowTime(
                formatLocal.long(entry.date),
                formatLocal.time(entry.minute),
              )}
              status={
                entry.photos.length > 0
                  ? { text: diaryText.photoCount(entry.photos.length) }
                  : undefined
              }
              onPress={() =>
                router.push({ pathname: '/edit-diary/[id]', params: { id: entry.id } })
              }
            />
            <View style={styles.text}>
              <AppText>{entry.text}</AppText>
            </View>
            {entry.photos.length > 0 ? (
              <View style={styles.photos}>
                {entry.photos.map((photo, index) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.uri }}
                    accessibilityLabel={photosText.label(index + 1, entry.photos.length)}
                    accessibilityRole="image"
                    style={[styles.photo, { backgroundColor: palette.line }]}
                    resizeMode="cover"
                  />
                ))}
              </View>
            ) : null}
          </Sheet>
        </View>
      ))}
      {dogId ? (
        <Button
          label={diaryText.add}
          icon="plus"
          onPress={() => router.push({ pathname: '/new-diary', params: { dogId } })}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { paddingHorizontal: space.s4, paddingBottom: space.s3 },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s2,
    paddingHorizontal: space.s4,
    paddingBottom: space.s4,
  },
  photo: { width: 96, height: 96, borderRadius: radius.field },
});
