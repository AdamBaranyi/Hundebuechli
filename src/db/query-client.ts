import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query über den Repositories. Die Daten liegen auf dem Gerät, darum:
 * - networkMode 'always': Abfragen laufen auch im Flugmodus. Mit der Vorgabe
 *   'online' hielte TanStack Query sie ohne Netz an.
 * - Nach jeder Änderung wird gezielt invalidiert; sonst gilt, was gelesen ist.
 * - Keine Wiederholung: Ein Fehler der lokalen Datenbank löst sich nicht durch
 *   einen zweiten Versuch.
 */
export function createQueryClient(options: { gcTime?: number } = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { networkMode: 'always', staleTime: Infinity, retry: false, ...options },
      mutations: { networkMode: 'always', retry: false },
    },
  });
}
