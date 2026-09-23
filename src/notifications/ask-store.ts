import { useSyncExternalStore } from 'react';

/*
 * Ob gerade nach der Erlaubnis gefragt wird. Als kleiner Speicher ausserhalb
 * von React: Der Abgleich läuft in einem Effekt, und der darf keinen Zustand
 * setzen.
 */

let asking = false;
let askedThisSession = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Fragt höchstens einmal je Sitzung; mehr wäre Drängen. */
export function askOnce(): void {
  if (askedThisSession) return;
  askedThisSession = true;
  asking = true;
  emit();
}

export function closeAsk(): void {
  asking = false;
  emit();
}

/** Nur für Tests: die Sitzung beginnt wieder von vorne. */
export function resetAsk(): void {
  asking = false;
  askedThisSession = false;
  emit();
}

export function useAskingPermission(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => asking,
  );
}
