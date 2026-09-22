import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useDogCount } from './queries';

/**
 * Formulare für Einträge und Hunde gibt es nur, wenn schon ein Hund
 * eingetragen ist. Wer eine solche Adresse ohne Hund öffnet – im Browser
 * beginnt jeder Aufruf frisch –, landet beim Erststart.
 */
export function RequireDogs({ children }: { children: ReactNode }) {
  const count = useDogCount();
  if (count.isError) throw count.error;
  if (count.isPending) return null;
  if (!count.data) return <Redirect href="/welcome" />;
  return children;
}
