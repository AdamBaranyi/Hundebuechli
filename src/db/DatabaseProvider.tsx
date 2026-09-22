import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { openDatabase } from './client';
import type { Db } from './types';

/** Nur für Tests direkt zu verwenden; die App nimmt DatabaseProvider. */
export const DatabaseContext = createContext<Db | null>(null);

type State = { db: Db } | { error: unknown } | null;

type Props = {
  children: ReactNode;
  /** Wird einmal gerufen, sobald die Datenbank offen und migriert ist. */
  onReady?: () => void;
};

/**
 * Öffnet die Datenbank und wendet die Migrationen an, bevor irgendein
 * Bildschirm sie braucht. Bis dahin bleibt der Startbildschirm stehen; ein
 * Fehler geht an die Fehlergrenze der Route.
 */
export function DatabaseProvider({ children, onReady }: Props) {
  const [state, setState] = useState<State>(null);

  useEffect(() => {
    let active = true;
    openDatabase().then(
      (db) => active && setState({ db }),
      (error: unknown) => active && setState({ error }),
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (state && 'db' in state) onReady?.();
  }, [state, onReady]);

  if (state && 'error' in state) throw state.error;
  if (!state) return null;
  return <DatabaseContext.Provider value={state.db}>{children}</DatabaseContext.Provider>;
}

/** Die offene Datenbank. Nur für Hooks und Repositories, nie direkt in Komponenten. */
export function useDb(): Db {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDb ausserhalb von DatabaseProvider');
  return db;
}
