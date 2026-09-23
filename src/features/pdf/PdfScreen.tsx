import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { formatLocal, parseInputDate } from '@/content/format';
import { pdfText } from '@/content/pdf';
import { validationMessage } from '@/content/validation';
import { announce } from '@/ui/announce';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { DateField } from '@/ui/DateField';
import { Notice } from '@/ui/Notice';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';
import { TimeField } from '@/ui/TimeField';
import { space } from '@/ui/tokens';
import { useToday } from '@/ui/useToday';

import { useDog } from '../dogs/queries';
import { parseTime } from '../medications/medication-form';
import { useOwner } from '../settings/owner-queries';
import { type PdfKind, type PdfRequest, useCreatePdf } from './create-pdf';

const PERIODS = [
  { value: '30', label: 'Letzte 30 Tage' },
  { value: '90', label: 'Letzte 3 Monate' },
  { value: '365', label: 'Letzte 12 Monate' },
] as const;

const close = () => (router.canGoBack() ? router.back() : router.replace('/dogs'));

/**
 * PDF erstellen: Vorlage wählen, beim Plakat Ort und Zeit eintragen, dann
 * erstellen und teilen. Das Plakat soll in einer Minute unterwegs sein.
 */
export function PdfScreen({ dogId, initialKind }: { dogId: string; initialKind: PdfKind }) {
  const today = useToday();
  const dog = useDog(dogId);
  const owner = useOwner();
  const create = useCreatePdf();
  const now = new Date();
  const [kind, setKind] = useState<PdfKind>(initialKind);
  const [period, setPeriod] = useState<string>('30');
  const [place, setPlace] = useState('');
  const [dateText, setDateText] = useState(formatLocal.input(today));
  const [timeText, setTimeText] = useState(
    formatLocal.time(now.getHours() * 60 + now.getMinutes()),
  );
  const [phone, setPhone] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const shownPhone = phone ?? owner.data?.phone ?? '';
  const t = pdfText.poster;

  function request(): PdfRequest | null {
    if (kind === 'vet') return { kind, dogId, today, diaryDays: Number(period) };
    if (kind === 'sitter') return { kind, dogId, today };
    const date = parseInputDate(dateText);
    const minute = parseTime(timeText);
    const next: Record<string, string> = {};
    if (!place.trim()) next.place = validationMessage('place', 'required');
    if (!date) next.date = validationMessage('date', 'invalid_date');
    if (minute === null) next.time = validationMessage('time', 'invalid_time');
    if (!shownPhone.trim()) next.phone = validationMessage('phone', 'required');
    setErrors(next);
    if (!date || minute === null || Object.keys(next).length > 0) {
      announce(Object.values(next)[0] ?? '');
      return null;
    }
    return {
      kind,
      dogId,
      today,
      details: { place: place.trim(), date, minute, phone: shownPhone.trim() },
    };
  }

  function submit() {
    const next = request();
    if (!next) return;
    create.mutate(next, { onError: () => announce(pdfText.failed) });
  }

  return (
    <Screen inModal>
      <View style={{ gap: space.s1 }}>
        <Button label={pdfText.cancel} variant="text" onPress={close} />
        <AppText variant="largeTitle" heading={1}>
          {pdfText.screenTitle}
        </AppText>
        {dog.data ? <AppText color="pencil">{dog.data.name}</AppText> : null}
      </View>
      <View style={{ gap: space.s2 }}>
        <ChoiceChips
          label={pdfText.section}
          choices={(['vet', 'sitter', 'poster'] as const).map((value) => ({
            value,
            label: pdfText.kinds[value],
          }))}
          selected={kind}
          onSelect={setKind}
        />
        <AppText color="pencil">{pdfText.kindHints[kind]}</AppText>
      </View>
      {kind === 'vet' ? (
        <View style={{ gap: space.s2 }}>
          <AppText variant="secondary" weight="medium" color="pencil">
            {pdfText.diaryPeriod}
          </AppText>
          <ChoiceChips
            label={pdfText.diaryPeriod}
            choices={PERIODS}
            selected={period}
            onSelect={setPeriod}
          />
        </View>
      ) : null}
      {kind === 'poster' ? (
        <View style={{ gap: space.s4 }}>
          <TextField
            label={t.place}
            hint={t.placeHint}
            value={place}
            onChangeText={setPlace}
            error={errors.place ?? null}
          />
          <DateField
            label={t.when}
            value={dateText}
            onChangeText={setDateText}
            error={errors.date ?? null}
          />
          <TimeField
            label={t.time}
            value={timeText}
            onChangeText={setTimeText}
            error={errors.time ?? null}
          />
          <TextField
            label={t.phone}
            hint={t.phoneHint}
            inputMode="tel"
            keyboardType="phone-pad"
            value={shownPhone}
            onChangeText={setPhone}
            error={errors.phone ?? null}
          />
        </View>
      ) : null}
      {Platform.OS === 'web' ? <Notice text={pdfText.webNotice} /> : null}
      {create.isError ? (
        <AppText variant="secondary" weight="bold" color="carmine" role="alert">
          {pdfText.failed}
        </AppText>
      ) : null}
      <Button
        label={create.isPending ? pdfText.busy : pdfText.create}
        icon="share"
        disabled={create.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
