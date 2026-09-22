import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { DatabaseContext } from '@/db/DatabaseProvider';
import { createQueryClient } from '@/db/query-client';
import { createTestDb } from '@/db/testing';
import type { Db } from '@/db/types';

/**
 * Rendert einen Bildschirm mit echter Datenbank (sql.js im Speicher) und
 * TanStack Query, wie in der App. Nur für Tests.
 */
export async function renderWithData(ui: ReactElement, prepare?: (db: Db) => void) {
  const db = await createTestDb();
  prepare?.(db);
  const client = createQueryClient();
  const result = await render(
    <QueryClientProvider client={client}>
      <DatabaseContext.Provider value={db}>{ui}</DatabaseContext.Provider>
    </QueryClientProvider>,
  );
  return { ...result, db, client };
}
