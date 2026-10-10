import { screen, userEvent } from '@testing-library/react-native';

import { createDog } from '@/db/repositories/dogs';
import { DiaryFormScreen } from '@/features/diary/DiaryFormScreen';
import { DocumentFormScreen } from '@/features/documents/DocumentFormScreen';
import { renderWithData } from '@/test/render-with-data';
import { textSizes } from '@/ui/__tests__/text-sizes';

jest.mock('expo-router', () => ({
  ...jest.requireActual<object>('expo-router'),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
}));

// Wer nur die Art vergisst, muss nach «Sichern» sehen, was fehlt, nicht nur
// hören (WCAG 3.3.1). Ein einziger Hund ist im Formular schon gewählt.
describe('Sichern ohne Art', () => {
  it('Dokument: zeigt «Wähle die Art des Dokuments.» als Meldung, nie unter 16 pt', async () => {
    const { container } = await renderWithData(
      <DocumentFormScreen documentId={null} dogId={null} />,
      (db) => createDog(db, { name: 'Bäri' }),
    );
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Titel'), 'Police 2026');
    await user.press(screen.getByRole('button', { name: 'Sichern' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Wähle die Art des Dokuments.');
    expect(textSizes(container).filter((t) => (t.fontSize ?? 0) < 16)).toEqual([]);
  });

  it('Tagebuch: zeigt «Wähle, worum es geht.» als Meldung, nie unter 16 pt', async () => {
    const { container } = await renderWithData(
      <DiaryFormScreen entryId={null} dogId={null} />,
      (db) => createDog(db, { name: 'Bäri' }),
    );
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Notiz'), 'Hat nur die Hälfte gefressen.');
    await user.press(screen.getByRole('button', { name: 'Sichern' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Wähle, worum es geht.');
    expect(textSizes(container).filter((t) => (t.fontSize ?? 0) < 16)).toEqual([]);
  });
});
