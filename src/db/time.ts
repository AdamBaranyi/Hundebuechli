import { randomUUID } from 'expo-crypto';

/** Neue ID für jede Zeile: eine zufällige UUID. */
export function newId(): string {
  return randomUUID();
}

/** Zeitstempel für erstellt und geändert, immer in UTC. */
export function nowUtc(): string {
  return new Date().toISOString();
}
