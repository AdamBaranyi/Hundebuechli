import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';

import { common } from '@/content/common';
import { formatLocal } from '@/content/format';
import { overviewText } from '@/content/overview';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { toast } from '@/ui/toast';
import { Button } from '@/ui/Button';
import { DogChooser } from '@/ui/DogChooser';
import { Notice } from '@/ui/Notice';
import { Screen } from '@/ui/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { space } from '@/ui/tokens';
import { useToday } from '@/ui/useToday';

import { useDogList } from '../dogs/queries';
import { useCompleteEntry, useOpenDue, useUndoCompletion } from '../health/queries';
import { buildOverview, type OverviewRow } from './overview-model';
import { OverviewSection } from './OverviewSection';

/**
 * «Als Nächstes»: fällig und bald fällig über alle Hunde. Ein Tipp aufs
 * Stempelfeld erledigt; die Zeile bleibt an ihrem Platz, bis der Bildschirm
 * neu geöffnet wird – nichts springt unter dem Finger weg.
 */
export function OverviewScreen() {
  const today = useToday();
  const open = useOpenDue();
  const dogs = useDogList();
  const complete = useCompleteEntry();
  const undo = useUndoCompletion();
  const [dogId, setDogId] = useState<string | null>(null);
  const [stamped, setStamped] = useState<ReadonlySet<string>>(new Set());

  const { refetch } = open;
  useFocusEffect(
    useCallback(() => {
      void refetch();
      setStamped(new Set());
    }, [refetch]),
  );

  const sections = useMemo(
    () => buildOverview(open.data ?? [], today, dogId),
    [open.data, today, dogId],
  );

  function stamp(row: OverviewRow) {
    complete.mutate(
      { id: row.id, today },
      {
        onSuccess: () => {
          setStamped((current) => new Set(current).add(row.id));
          announce(overviewText.announceDone(row.title, row.dogName));
        },
      },
    );
  }

  function unstamp(row: OverviewRow) {
    undo.mutate(row.id, {
      onSuccess: () => {
        setStamped((current) => {
          const next = new Set(current);
          next.delete(row.id);
          return next;
        });
        announce(overviewText.announceOpen(row.title, row.dogName));
      },
      onError: () => {
        // Misslingt das Zurücknehmen, bleibt der Stempel stehen: Ohne Meldung
        // sähe es aus, als wäre nichts geschehen.
        toast(overviewText.undoFailed);
        announce(overviewText.undoFailed);
      },
    });
  }

  const dogOptions = (dogs.data ?? []).map((dog) => ({
    id: dog.id,
    name: dog.name,
    photoUri: dog.photoUri,
  }));
  const addEntry = () => router.push('/new-entry');

  return (
    <Screen inTabs>
      <View style={{ gap: space.s1 }}>
        <AppText variant="largeTitle" heading={1}>
          {overviewText.title}
        </AppText>
        <AppText color="pencil">{formatLocal.weekday(today)}</AppText>
      </View>
      {dogOptions.length > 1 ? (
        <DogChooser
          label={overviewText.filterLabel}
          dogs={dogOptions}
          selected={dogId}
          onSelect={setDogId}
          allLabel={overviewText.all}
        />
      ) : null}
      {open.isPending ? <LoadingState /> : null}
      {open.isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {open.isSuccess && sections.length === 0 ? (
        <EmptyState
          title={overviewText.nothingDue}
          text={overviewText.nothingPlanned}
          action={{ label: overviewText.addEntry, onPress: addEntry }}
        />
      ) : null}
      {sections.map((section) => (
        <OverviewSection
          key={section.bucket}
          section={section}
          today={today}
          stamped={stamped}
          onStamp={stamp}
          onUndo={unstamp}
        />
      ))}
      {sections.length > 0 ? (
        <Button label={overviewText.addEntry} variant="secondary" icon="plus" onPress={addEntry} />
      ) : null}
      {Platform.OS === 'web' ? <Notice text={common.webPreview} /> : null}
    </Screen>
  );
}
