import { screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { listDiaryEntries } from '@/db/repositories/diary';
import { listDocuments } from '@/db/repositories/documents';
import { listDogs } from '@/db/repositories/dogs';
import { listHealthEntries } from '@/db/repositories/health';
import { listDosesFrom, listMedications } from '@/db/repositories/medications';
import { listWeights } from '@/db/repositories/weights';
import type { Db } from '@/db/types';
import { BAERI_ID, loadDemoData, MILA_ID } from '@/demo/demo-data';
import { renderWithData } from '@/test/render-with-data';

import { DiaryFormScreen } from '../diary/DiaryFormScreen';
import { DocumentFormScreen } from '../documents/DocumentFormScreen';
import { DogFormScreen } from '../dogs/DogFormScreen';
import { HealthFormScreen } from '../health/HealthFormScreen';
import { MedicationFormScreen } from '../medications/MedicationFormScreen';
import { PdfScreen } from '../pdf/PdfScreen';

jest.mock('expo-router', () => ({
  ...jest.requireActual<object>('expo-router'),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
}));

jest.mock('@/pdf/share', () => ({
  loadPdfFonts: jest.fn(async () => null),
  sharePdf: jest.fn(async () => undefined),
}));

/** Alles, was ein Deep Link verändern könnte, als Schnappschuss. */
function snapshot(db: Db) {
  const both = <T,>(read: (dogId: string) => T) => [BAERI_ID, MILA_ID].map(read);
  return JSON.stringify({
    dogs: listDogs(db, { includeArchived: true }),
    health: both((id) => listHealthEntries(db, id)),
    medications: both((id) => listMedications(db, id)),
    doses: listDosesFrom(db, '2000-01-01T00:00'),
    weights: both((id) => listWeights(db, id)),
    diary: both((id) => listDiaryEntries(db, id)),
    documents: both((id) => listDocuments(db, id)),
  });
}

type Ids = { entry: string; medication: string; diary: string; document: string };

/** Baut den Bildschirm erst beim Rendern: Die Kennungen entstehen mit der Datenbank. */
function Lazy({ make, ids }: { make: (ids: Ids) => ReactElement; ids: Ids }) {
  return make(ids);
}

const links: [string, (ids: Ids) => ReactElement][] = [
  ['hundebuechli://edit-dog/<id>', () => <DogFormScreen dogId={BAERI_ID} />],
  [
    'hundebuechli://edit-entry/<id>',
    (ids) => <HealthFormScreen entryId={ids.entry} dogId={null} kind={null} />,
  ],
  [
    'hundebuechli://edit-medication/<id>',
    (ids) => <MedicationFormScreen medicationId={ids.medication} dogId={null} />,
  ],
  ['hundebuechli://edit-diary/<id>', (ids) => <DiaryFormScreen entryId={ids.diary} dogId={null} />],
  [
    'hundebuechli://edit-document/<id>',
    (ids) => <DocumentFormScreen documentId={ids.document} dogId={null} />,
  ],
  [
    'hundebuechli://pdf/<id>?kind=poster',
    () => <PdfScreen dogId={BAERI_ID} initialKind="poster" />,
  ],
];

describe('Deep Links von aussen', () => {
  it.each(links)('%s öffnet nur – erledigt, ändert und löscht nichts', async (_link, make) => {
    const ids = {} as Ids;
    let before = '';
    const { db } = await renderWithData(<Lazy make={make} ids={ids} />, (database) => {
      loadDemoData(database, '2026-09-22', { baeri: null, mila: null });
      ids.entry = listHealthEntries(database, BAERI_ID)[0]?.id ?? '';
      ids.medication = listMedications(database, MILA_ID)[0]?.id ?? '';
      ids.diary = listDiaryEntries(database, MILA_ID)[0]?.id ?? '';
      ids.document = listDocuments(database, MILA_ID)[0]?.id ?? '';
      before = snapshot(database);
    });

    // Warten, bis das Formular steht: dann ist alles geladen, was ein Link auslösen könnte.
    await waitFor(() => expect(screen.getAllByRole('button').length).toBeGreaterThan(1));
    expect(snapshot(db)).toBe(before);
    const { sharePdf } = jest.requireMock<{ sharePdf: jest.Mock }>('@/pdf/share');
    expect(sharePdf).not.toHaveBeenCalled();
  });
});
