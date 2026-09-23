import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { dogsText } from '@/content/dogs';
import { medicationsText } from '@/content/medications';
import { weightsText } from '@/content/weights';
import { formatAge, formatLocal } from '@/content/format';
import { chipCountryCode, formatChipNumber } from '@/domain/chip';
import { ageOf } from '@/domain/dog-age';
import { lastTwelveMonths } from '@/domain/calendar';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { toast } from '@/ui/toast';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import type { IconName } from '@/ui/icon-shapes';
import { Notice } from '@/ui/Notice';
import { Row } from '@/ui/Row';
import { Screen } from '@/ui/Screen';
import { SectionTitle } from '@/ui/SectionTitle';
import { Sheet } from '@/ui/Sheet';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { usePalette } from '@/ui/theme';
import { radius, space } from '@/ui/tokens';
import { useToday } from '@/ui/useToday';

import { useHealthEntries } from '../health/queries';
import { useMedications } from '../medications/queries';
import { useWeights } from '../weights/queries';
import { DogActions } from './DogActions';
import { DogPhotoPanel } from './DogPhotoPanel';
import { type DogWithPhoto, useDog } from './queries';
import { YearStamps } from './YearStamps';

function QuickAction(props: { icon: IconName; label: string; value: string; onPress: () => void }) {
  const palette = usePalette();
  return (
    <Pressable
      role="button"
      accessibilityLabel={`${props.label}, ${props.value}`}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.quick,
        { backgroundColor: pressed ? palette.pressed : palette.sheet },
      ]}
    >
      <Icon name={props.icon} />
      <View style={styles.quickText}>
        <AppText variant="secondary" color="pencil">
          {props.label}
        </AppText>
        <AppText weight="bold">{props.value}</AppText>
      </View>
    </Pressable>
  );
}

function subline(dog: DogWithPhoto, today: string): string {
  const age = ageOf(dog, today);
  return [dog.breed, dog.sex ? dogsText.sex[dog.sex] : null, age ? formatAge(age) : null]
    .filter(Boolean)
    .join(', ');
}

/** Hundeprofil: Foto, Name, Schnellzugriffe, das Jahr in Stempeln, alles zum Hund. */
export function DogProfileScreen({ dogId }: { dogId: string | null }) {
  const today = useToday();
  const dog = useDog(dogId);
  const entries = useHealthEntries(dogId ?? '');
  const medications = useMedications(dogId ?? '');
  const weights = useWeights(dogId ?? '');

  if (dog.isPending)
    return (
      <Screen withHeader>
        <LoadingState />
      </Screen>
    );
  if (dog.isError)
    return (
      <Screen withHeader>
        <ErrorState onRetry={() => void dog.refetch()} />
      </Screen>
    );
  if (!dog.data) {
    return (
      <Screen withHeader>
        <EmptyState title={dogsText.notFound} heading={1} />
      </Screen>
    );
  }
  const data = dog.data;
  const list = entries.data ?? [];
  const months = lastTwelveMonths(today);

  async function copyChip() {
    if (!data.chipNumber) return;
    await Clipboard.setStringAsync(data.chipNumber);
    // Kopieren verändert nichts auf dem Bildschirm: Ohne Meldung bliebe offen,
    // ob es geklappt hat (Gerätetest 23.09.2026).
    toast(dogsText.profile.chipCopied);
    announce(dogsText.profile.chipCopied);
  }

  return (
    <Screen withHeader inTabs>
      <DogPhotoPanel dog={data} />
      <View style={{ gap: space.s1 }}>
        <AppText variant="display" heading={1}>
          {data.name}
        </AppText>
        {subline(data, today) ? <AppText color="pencil">{subline(data, today)}</AppText> : null}
      </View>
      {data.archivedAt ? <Notice text={dogsText.archivedNote} /> : null}
      {data.chipNumber || data.vetPhone ? (
        <View style={styles.quickRow}>
          {data.chipNumber ? (
            <QuickAction
              icon="copy"
              label={dogsText.profile.copyChip}
              value={formatChipNumber(data.chipNumber)}
              onPress={() => void copyChip()}
            />
          ) : null}
          {data.vetPhone ? (
            <QuickAction
              icon="phone"
              label={dogsText.profile.callVet}
              value={data.vetName ?? data.vetPhone}
              onPress={() => void Linking.openURL(`tel:${data.vetPhone?.replace(/[^\d+]/g, '')}`)}
            />
          ) : null}
        </View>
      ) : null}
      {data.chipNumber && chipCountryCode(data.chipNumber) ? (
        <AppText variant="secondary" color="pencil">
          {dogsText.chipCountry.CH}
        </AppText>
      ) : null}
      {list.length > 0 ? (
        <View style={{ gap: space.s3 }}>
          <View>
            <SectionTitle>{dogsText.profile.year}</SectionTitle>
            <AppText variant="secondary" color="pencil">
              {dogsText.profile.yearRange(
                formatLocal.monthYear(`${months[0]}-01`),
                formatLocal.monthYear(`${months[11]}-01`),
              )}
            </AppText>
          </View>
          <YearStamps
            entries={list}
            today={today}
            onOpen={() => router.push({ pathname: '/dogs/[id]/health', params: { id: data.id } })}
          />
        </View>
      ) : null}
      <View style={{ gap: space.s3 }}>
        <SectionTitle>{dogsText.profile.all(data.name)}</SectionTitle>
        <Sheet>
          <Row
            icon="syringe"
            title={dogsText.profile.health}
            secondary={
              list.length > 0 ? dogsText.profile.entries(list.length) : dogsText.profile.noEntries
            }
            onPress={() => router.push({ pathname: '/dogs/[id]/health', params: { id: data.id } })}
          />
          <Row
            icon="pill"
            title={medicationsText.title}
            secondary={
              medications.data?.length
                ? dogsText.profile.medicationCount(medications.data.length)
                : dogsText.profile.noMedications
            }
            onPress={() =>
              router.push({ pathname: '/dogs/[id]/medication', params: { id: data.id } })
            }
          />
          <Row
            icon="scale"
            title={weightsText.title}
            secondary={
              weights.data?.at(-1)
                ? formatLocal.kilograms(weights.data.at(-1)?.grams ?? 0)
                : dogsText.profile.noWeight
            }
            onPress={() => router.push({ pathname: '/dogs/[id]/weight', params: { id: data.id } })}
          />
        </Sheet>
      </View>
      <Button
        label={dogsText.profile.addEntry}
        icon="plus"
        onPress={() => router.push({ pathname: '/new-entry', params: { dogId: data.id } })}
      />
      <DogActions dog={data} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s3 },
  quick: {
    flexGrow: 1,
    flexBasis: 240,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: 64,
    paddingVertical: space.s3,
    paddingHorizontal: space.s4,
    borderRadius: radius.sheet,
  },
  quickText: { flex: 1, minWidth: 0 },
});
