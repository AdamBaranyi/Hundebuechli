import { router } from 'expo-router';
import { useState } from 'react';

import { documentCategories, documentsText } from '@/content/documents';
import { formatLocal, parseInputDate } from '@/content/format';
import { photosText } from '@/content/photos';
import { statesText } from '@/content/states';
import { validationMessage } from '@/content/validation';
import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@/domain/document';
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

import { useDogList } from '../dogs/queries';
import { AttachedPhotos, type PhotoView } from '../photos/AttachedPhotos';
import { DocumentViewer } from './DocumentViewer';
import { type DocumentView, useDeleteDocument, useDocument, useSaveDocument } from './queries';

const close = () => (router.canGoBack() ? router.back() : router.replace('/dogs'));

type Props = { documentId: string | null; dogId: string | null };

/** Dokument anlegen oder ändern; Seiten kommen als Fotos zum gesicherten Dokument. */
export function DocumentFormScreen({ documentId, dogId }: Props) {
  const dogs = useDogList();
  const existing = useDocument(documentId);
  if (dogs.isPending || (documentId && existing.isPending)) {
    return (
      <Screen inModal>
        <LoadingState />
      </Screen>
    );
  }
  if (documentId && !existing.data) {
    return (
      <Screen inModal>
        <EmptyState
          title={documentsText.notFound}
          heading={1}
          action={{ label: documentsText.cancel, onPress: close }}
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
    <DocumentForm
      documentId={documentId}
      document={existing.data ?? null}
      dogs={options}
      initialDogId={dogId ?? onlyDog}
    />
  );
}

type FormProps = {
  documentId: string | null;
  document: DocumentView | null;
  dogs: DogOption[];
  initialDogId: string | null;
};

function DocumentForm({ documentId, document, dogs, initialDogId }: FormProps) {
  const save = useSaveDocument();
  const remove = useDeleteDocument();
  const [selectedDog, setSelectedDog] = useState(document?.dogId ?? initialDogId);
  const [category, setCategory] = useState<DocumentCategory | null>(document?.category ?? null);
  const [title, setTitle] = useState(document?.title ?? '');
  const [dateText, setDateText] = useState(document?.date ? formatLocal.input(document.date) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [open, setOpen] = useState<PhotoView | null>(null);

  function submit() {
    const date = dateText.trim() ? parseInputDate(dateText) : null;
    const next: Record<string, string> = {};
    if (!selectedDog) next.dogId = validationMessage('dogId', 'required');
    if (!category) next.category = validationMessage('documentCategory', 'required');
    if (!title.trim()) next.title = validationMessage('title', 'required');
    if (dateText.trim() && !date) next.date = validationMessage('date', 'invalid_date');
    if (!selectedDog || !category || Object.keys(next).length > 0) {
      setErrors(next);
      announce(Object.values(next)[0] ?? '');
      return;
    }
    save.mutate(
      { id: documentId, input: { dogId: selectedDog, category, title, date } },
      {
        onSuccess: () => {
          announce(documentsText.saved);
          close();
        },
      },
    );
  }

  function confirmDelete() {
    if (!documentId) return;
    setConfirming(false);
    remove.mutate(documentId, {
      onSuccess: () => {
        announce(documentsText.removed);
        close();
      },
    });
  }

  const f = documentsText.fields;
  return (
    <FormScreen
      title={documentId ? documentsText.editTitle : documentsText.newTitle}
      cancelLabel={documentsText.cancel}
      onCancel={close}
      saveLabel={documentsText.save}
      onSave={submit}
      saving={save.isPending}
      saveError={save.isError ? statesText.saveFailed : null}
    >
      {dogs.length > 1 ? (
        <DogChooser label={f.dog} dogs={dogs} selected={selectedDog} onSelect={setSelectedDog} />
      ) : null}
      <ChoiceChips
        label={f.category}
        choices={DOCUMENT_CATEGORIES.map((value) => ({
          value,
          label: documentCategories[value],
        }))}
        selected={category}
        onSelect={setCategory}
      />
      <TextField
        label={f.title}
        hint={f.titleHint}
        value={title}
        onChangeText={setTitle}
        error={errors.title ?? null}
      />
      <DateField
        label={f.date}
        hint={f.dateHint}
        value={dateText}
        onChangeText={setDateText}
        error={errors.date ?? null}
      />
      {documentId && document ? (
        <AttachedPhotos parent={{ documentId }} photos={document.pages} onOpen={setOpen} />
      ) : (
        <Notice text={photosText.onlyAfterSave} />
      )}
      {documentId ? (
        <>
          <Button label={documentsText.remove} variant="text" onPress={() => setConfirming(true)} />
          <ConfirmDialog
            visible={confirming}
            title={documentsText.removeTitle}
            text={documentsText.removeText}
            confirmLabel={documentsText.remove}
            cancelLabel={documentsText.cancel}
            onConfirm={confirmDelete}
            onCancel={() => setConfirming(false)}
          />
        </>
      ) : null}
      <DocumentViewer
        uri={open?.uri ?? null}
        label={document?.title ?? ''}
        onClose={() => setOpen(null)}
      />
    </FormScreen>
  );
}
