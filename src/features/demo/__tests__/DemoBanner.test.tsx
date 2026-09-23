import { screen, waitFor } from '@testing-library/react-native';

import { queryKeys } from '@/db/query-keys';

import { updateSettings } from '@/db/repositories/settings';
import { renderWithData } from '@/test/render-with-data';

import { DemoBanner } from '../DemoBanner';

jest.mock('expo-router', () => ({
  ...jest.requireActual<object>('expo-router'),
  router: { navigate: jest.fn(), push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

describe('Streifen «Beispieldaten» auf dem Gerät', () => {
  it('steht da, solange Beispieldaten geladen sind', async () => {
    await renderWithData(<DemoBanner />, (db) => updateSettings(db, { demoLoaded: true }));
    expect(await screen.findByText('Beispieldaten')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Zu den Einstellungen' })).toBeOnTheScreen();
  });

  it('fehlt ohne Beispieldaten', async () => {
    const { client } = await renderWithData(<DemoBanner />);
    // Erst prüfen, wenn die Einstellungen geladen sind – sonst wäre «fehlt» ein Zufall.
    await waitFor(() => expect(client.getQueryState(queryKeys.settings)?.status).toBe('success'));
    expect(screen.queryByText('Beispieldaten')).toBeNull();
  });
});
