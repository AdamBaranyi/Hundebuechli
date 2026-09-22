import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { type LocalDate, toLocalDate } from '@/domain/local-date';

/**
 * Das heutige lokale Datum. Kommt die App über Nacht wieder in den
 * Vordergrund, stimmt es wieder – sonst stünde am Morgen «heute» vom Vortag.
 */
export function useToday(): LocalDate {
  const [today, setToday] = useState(() => toLocalDate(new Date()));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(toLocalDate(new Date()));
    });
    return () => subscription.remove();
  }, []);
  return today;
}
