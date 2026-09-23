import { router } from 'expo-router';
import { View } from 'react-native';

import { formatLocal } from '@/content/format';
import { medicationsText } from '@/content/medications';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Row } from '@/ui/Row';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { space } from '@/ui/tokens';

import { useDog } from '../dogs/queries';
import { useMedications } from './queries';

/** Die Medikamente eines Hundes; ein Tipp öffnet das Medikament. */
export function MedicationListScreen({ dogId }: { dogId: string | null }) {
  const dog = useDog(dogId);
  const medications = useMedications(dogId ?? '');
  const list = medications.data ?? [];

  return (
    <Screen withHeader inTabs>
      <View style={{ gap: space.s1 }}>
        <AppText variant="largeTitle" heading={1}>
          {medicationsText.title}
        </AppText>
        {dog.data ? <AppText color="pencil">{dog.data.name}</AppText> : null}
      </View>
      {medications.isPending ? <LoadingState /> : null}
      {medications.isError ? <ErrorState onRetry={() => void medications.refetch()} /> : null}
      {medications.isSuccess && list.length === 0 ? (
        <EmptyState title={medicationsText.empty} />
      ) : null}
      {list.length > 0 ? (
        <Sheet>
          {list.map((medication) => (
            <Row
              key={medication.id}
              icon="capsule"
              title={medication.name}
              secondary={medicationsText.summary(
                medication.dose,
                medication.times.map((minute) => formatLocal.time(minute)),
              )}
              status={
                !medication.active
                  ? { text: medicationsText.paused }
                  : medication.endDate
                    ? { text: medicationsText.ended(formatLocal.long(medication.endDate)) }
                    : undefined
              }
              onPress={() =>
                router.push({ pathname: '/edit-medication/[id]', params: { id: medication.id } })
              }
            />
          ))}
        </Sheet>
      ) : null}
      {dogId ? (
        <Button
          label={medicationsText.add}
          icon="plus"
          onPress={() => router.push({ pathname: '/new-medication', params: { dogId } })}
        />
      ) : null}
    </Screen>
  );
}
