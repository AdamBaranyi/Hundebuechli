import { router } from 'expo-router';
import { View } from 'react-native';

import { formatLocal } from '@/content/format';
import { healthKinds, healthText } from '@/content/health';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Row } from '@/ui/Row';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { space } from '@/ui/tokens';

import { useDog } from '../dogs/queries';
import { kindIcons } from './kind-icons';
import { useHealthEntries } from './queries';

/** Alle Gesundheitseinträge eines Hundes, der neuste zuerst; ein Tipp öffnet den Eintrag. */
export function HealthListScreen({ dogId }: { dogId: string | null }) {
  const dog = useDog(dogId);
  const entries = useHealthEntries(dogId ?? '');
  const list = entries.data ?? [];

  return (
    <Screen withHeader inTabs>
      <View style={{ gap: space.s1 }}>
        <AppText variant="largeTitle" heading={1}>
          {healthText.listTitle}
        </AppText>
        {dog.data ? <AppText color="pencil">{dog.data.name}</AppText> : null}
      </View>
      {entries.isPending ? <LoadingState /> : null}
      {entries.isError ? <ErrorState onRetry={() => void entries.refetch()} /> : null}
      {entries.isSuccess && list.length === 0 ? <EmptyState title={healthText.empty} /> : null}
      {list.length > 0 ? (
        <Sheet>
          {list.map((entry) => (
            <Row
              key={entry.id}
              icon={kindIcons[entry.kind]}
              title={healthKinds[entry.kind]}
              secondary={healthText.rowDetails(formatLocal.long(entry.date), entry.product)}
              status={
                entry.completedByEntryId
                  ? { text: healthText.rowDone }
                  : entry.nextDueDate
                    ? { text: healthText.rowNext(formatLocal.long(entry.nextDueDate)) }
                    : undefined
              }
              onPress={() =>
                router.push({ pathname: '/edit-entry/[id]', params: { id: entry.id } })
              }
            />
          ))}
        </Sheet>
      ) : null}
      {dogId ? (
        <Button
          label={healthText.newTitle}
          icon="plus"
          onPress={() => router.push({ pathname: '/new-entry', params: { dogId } })}
        />
      ) : null}
    </Screen>
  );
}
