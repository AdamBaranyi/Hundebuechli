import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { dogsText } from '@/content/dogs';
import { formatAge } from '@/content/format';
import { ageOf } from '@/domain/dog-age';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { DogAvatar } from '@/ui/DogAvatar';
import { Icon } from '@/ui/Icon';
import { Screen } from '@/ui/Screen';
import { SectionTitle } from '@/ui/SectionTitle';
import { Sheet } from '@/ui/Sheet';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { usePalette } from '@/ui/theme';
import { space } from '@/ui/tokens';
import { useToday } from '@/ui/useToday';

import { type DogWithPhoto, useDogList } from './queries';

function DogRow({ dog, today }: { dog: DogWithPhoto; today: string }) {
  const palette = usePalette();
  const age = ageOf(dog, today);
  const details = [dog.breed, age ? formatAge(age) : null].filter(Boolean).join(', ');
  return (
    <Pressable
      role="button"
      accessibilityLabel={[dog.name, details].filter(Boolean).join(', ')}
      onPress={() => router.push({ pathname: '/dogs/[id]', params: { id: dog.id } })}
      style={({ pressed }) => [styles.row, pressed ? { backgroundColor: palette.pressed } : null]}
    >
      <DogAvatar uri={dog.photoUri} />
      <View style={styles.text}>
        <AppText weight="bold">{dog.name}</AppText>
        {details ? (
          <AppText variant="secondary" color="pencil">
            {details}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevronRight" size={20} color="pencil" />
    </Pressable>
  );
}

/** Alle Hunde; archivierte stehen darunter, ihre Einträge bleiben lesbar. */
export function DogsScreen() {
  const today = useToday();
  const dogs = useDogList(true);
  const active = (dogs.data ?? []).filter((dog) => !dog.archivedAt);
  const archived = (dogs.data ?? []).filter((dog) => dog.archivedAt);

  return (
    <Screen inTabs>
      <AppText variant="largeTitle" heading={1}>
        {dogsText.title}
      </AppText>
      {dogs.isPending ? <LoadingState /> : null}
      {dogs.isError ? <ErrorState onRetry={() => void dogs.refetch()} /> : null}
      {dogs.isSuccess && active.length === 0 ? <EmptyState title={dogsText.empty} /> : null}
      {active.length > 0 ? (
        <Sheet dividerInset={88}>
          {active.map((dog) => (
            <DogRow key={dog.id} dog={dog} today={today} />
          ))}
        </Sheet>
      ) : null}
      <Button label={dogsText.add} icon="plus" onPress={() => router.push('/new-dog')} />
      {archived.length > 0 ? (
        <View style={{ gap: space.s3 }}>
          <SectionTitle>{dogsText.archivedTitle}</SectionTitle>
          <Sheet dividerInset={88}>
            {archived.map((dog) => (
              <DogRow key={dog.id} dog={dog} today={today} />
            ))}
          </Sheet>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: 72,
    paddingVertical: space.s2,
    paddingHorizontal: space.s4,
  },
  text: { flex: 1, minWidth: 0 },
});
