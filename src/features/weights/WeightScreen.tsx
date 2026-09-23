import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { formatLocal } from '@/content/format';
import { weightsText } from '@/content/weights';
import { changeSincePrevious } from '@/domain/weight';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { Screen } from '@/ui/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { space } from '@/ui/tokens';

import { useDog } from '../dogs/queries';
import { useWeights } from './queries';
import { WeightChart } from './WeightChart';
import { WeightTable } from './WeightTable';

type Shown = 'curve' | 'table';

/**
 * Gewicht eines Hundes: aktueller Wert gross, die Veränderung in Worten –
 * die App bewertet nicht –, darunter Kurve oder Tabelle. Die Tabelle ist das
 * Gegenstück zur Kurve, nicht ihr Ersatz für den Notfall.
 */
export function WeightScreen({ dogId }: { dogId: string | null }) {
  const dog = useDog(dogId);
  const weights = useWeights(dogId ?? '');
  const [shown, setShown] = useState<Shown>('curve');
  const rows = weights.data ?? [];
  const points = rows.map((row) => ({ date: row.date, grams: row.grams }));
  const latest = rows.at(-1);
  const change = changeSincePrevious(points);

  return (
    <Screen withHeader inTabs>
      <View style={{ gap: space.s1 }}>
        <AppText variant="largeTitle" heading={1}>
          {weightsText.title}
        </AppText>
        {dog.data ? <AppText color="pencil">{dog.data.name}</AppText> : null}
      </View>
      {weights.isPending ? <LoadingState /> : null}
      {weights.isError ? <ErrorState onRetry={() => void weights.refetch()} /> : null}
      {weights.isSuccess && rows.length === 0 ? (
        <EmptyState title={weightsText.empty} text={weightsText.emptyText} />
      ) : null}
      {latest ? (
        <View style={{ gap: space.s1 }}>
          <AppText variant="display">{formatLocal.kilograms(latest.grams)}</AppText>
          <AppText color="pencil">{weightsText.measuredOn(formatLocal.long(latest.date))}</AppText>
          <AppText>
            {change
              ? weightsText.change[change.direction](
                  formatLocal.kilograms(change.grams),
                  formatLocal.long(change.since),
                )
              : weightsText.change.first}
          </AppText>
        </View>
      ) : null}
      {rows.length > 0 ? (
        <View style={{ gap: space.s4 }}>
          <ChoiceChips
            label={weightsText.title}
            choices={[
              { value: 'curve', label: weightsText.views.curve },
              { value: 'table', label: weightsText.views.table },
            ]}
            selected={shown}
            onSelect={setShown}
          />
          {shown === 'curve' ? (
            <WeightChart points={points} dogName={dog.data?.name ?? ''} />
          ) : (
            <WeightTable rows={rows} />
          )}
        </View>
      ) : null}
      {dogId ? (
        <Button
          label={weightsText.add}
          icon="plus"
          onPress={() => router.push({ pathname: '/new-weight', params: { dogId } })}
        />
      ) : null}
    </Screen>
  );
}
