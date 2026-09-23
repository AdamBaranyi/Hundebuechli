import { router } from 'expo-router';
import { useState } from 'react';

import { diaryCategories, diaryText } from '@/content/diary';
import { photosText } from '@/content/photos';
import { formatLocal, parseInputDate } from '@/content/format';
import { statesText } from '@/content/states';
import { validationMessage } from '@/content/validation';
import { DIARY_CATEGORIES, type DiaryCategory } from '@/domain/diary';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { DateField } from '@/ui/DateField';
import { DogChooser, type DogOption } from '@/ui/DogChooser';
import { FormScreen } from '@/ui/FormScreen';
import { Notice } from '@/ui/Notice';
import { Screen } from '@/ui/Screen';
import { EmptyState, LoadingState } from '@/ui/StateViews';
import { TextField } from '@/ui/TextField';
import { TimeField } from '@/ui/TimeField';
import { useToday } from '@/ui/useToday';

import { useDogList } from '../dogs/queries';
import { parseTime } from '../medications/medication-form';
import { AttachedPhotos } from '../photos/AttachedPhotos';
import {
  type DiaryEntryView,
  useDeleteDiaryEntry,
  useDiaryEntry,
  useSaveDiaryEntry,
} from './queries';

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

type Props = { entryId: string | null; dogId: string | null };

/** Tagebucheintrag schreiben oder ändern; Fotos kommen zum gesicherten Eintrag. */
export function DiaryFormScreen({ entryId, dogId }: Props) {
  const today = useToday();
  const dogs = useDogList();
  const existing = useDiaryEntry(entryId);

  if (dogs.isPending || (entryId && existing.isPending)) {
    return (
      <Screen inModal>
        <LoadingState />
      </Screen>
    );
  }
  if (entryId && !existing.data) {
    return (
      <Screen inModal>
        <EmptyState
          title={diaryText.notFound}
          heading={1}
          action={{ label: diaryText.cancel, onPress: close }}
        />
      </Screen>
    );
  }
  const options: DogOption[] = (dogs.data ?? []).map((dog) => ({
    id: dog.id,
    name: dog.name,
    photoUri: dog.photoUri,
  }));
  const onlyDog = options.length === 1 ? (options[0]?.id ?? null) : null;
  return (
    <DiaryForm
      entryId={entryId}
      entry={existing.data ?? null}
      dogs={options}
      initialDogId={dogId ?? onlyDog}
      today={today}
    />
  );
}

type FormProps = {
  entryId: string | null;
  entry: DiaryEntryView | null;
  dogs: DogOption[];
  initialDogId: string | null;
  today: string;
};

function DiaryForm({ entryId, entry, dogs, initialDogId, today }: FormProps) {
  const save = useSaveDiaryEntry();
  const remove = useDeleteDiaryEntry();
  const now = new Date();
  const [selectedDog, setSelectedDog] = useState(entry?.dogId ?? initialDogId);
  const [category, setCategory] = useState<DiaryCategory | null>(entry?.category ?? null);
  const [dateText, setDateText] = useState(formatLocal.input(entry?.date ?? today));
  const [timeText, setTimeText] = useState(
    formatLocal.time(entry?.minute ?? now.getHours() * 60 + now.getMinutes()),
  );
  const [text, setText] = useState(entry?.text ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  function submit() {
    const date = parseInputDate(dateText);
    const minute = parseTime(timeText);
    const next: Record<string, string> = {};
    if (!selectedDog) next.dogId = validationMessage('dogId', 'required');
    if (!category) next.category = validationMessage('category', 'required');
    if (!date) next.date = validationMessage('date', 'invalid_date');
    if (minute === null) next.time = validationMessage('time', 'invalid_time');
    if (!text.trim()) next.text = validationMessage('text', 'required');
    if (!selectedDog || !category || !date || minute === null || !text.trim()) {
      setErrors(next);
      announce(Object.values(next)[0] ?? '');
      return;
    }
    save.mutate(
      { id: entryId, input: { dogId: selectedDog, date, minute, category, text } },
      {
        onSuccess: () => {
          announce(diaryText.saved);
          close();
        },
      },
    );
  }

  function confirmDelete() {
    if (!entryId) return;
    setConfirming(false);
    remove.mutate(entryId, {
      onSuccess: () => {
        announce(diaryText.removed);
        close();
      },
    });
  }

  return (
    <FormScreen
      title={entryId ? diaryText.editTitle : diaryText.newTitle}
      cancelLabel={diaryText.cancel}
      onCancel={close}
      saveLabel={diaryText.save}
      onSave={submit}
      saving={save.isPending}
      saveError={save.isError ? statesText.saveFailed : null}
    >
      {dogs.length > 1 ? (
        <DogChooser
          label={diaryText.fields.dog}
          dogs={dogs}
          selected={selectedDog}
          onSelect={setSelectedDog}
        />
      ) : null}
      <ChoiceChips
        label={diaryText.fields.category}
        choices={DIARY_CATEGORIES.map((value) => ({ value, label: diaryCategories[value] }))}
        selected={category}
        onSelect={setCategory}
      />
      <DateField
        label={diaryText.fields.date}
        value={dateText}
        onChangeText={setDateText}
        error={errors.date ?? null}
      />
      <TimeField
        label={diaryText.fields.time}
        value={timeText}
        onChangeText={setTimeText}
        error={errors.time ?? null}
      />
      <TextField
        label={diaryText.fields.text}
        hint={diaryText.fields.textHint}
        multiline
        value={text}
        onChangeText={setText}
        error={errors.text ?? null}
      />
      {entryId && entry ? (
        <AttachedPhotos parent={{ diaryEntryId: entryId }} photos={entry.photos} />
      ) : (
        <Notice text={photosText.onlyAfterSave} />
      )}
      {entryId ? (
        <>
          <Button label={diaryText.remove} variant="text" onPress={() => setConfirming(true)} />
          <ConfirmDialog
            visible={confirming}
            title={diaryText.removeTitle}
            text={diaryText.removeText}
            confirmLabel={diaryText.remove}
            cancelLabel={diaryText.cancel}
            onConfirm={confirmDelete}
            onCancel={() => setConfirming(false)}
          />
        </>
      ) : null}
    </FormScreen>
  );
}
