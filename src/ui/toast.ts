import { useSyncExternalStore } from 'react';

/*
 * Kurzmeldungen für Handlungen, die sonst nichts sichtbar verändern – etwa
 * «Chipnummer kopiert». Rein sichtbar: Für VoiceOver und TalkBack bleibt
 * `announce`, sonst käme dieselbe Meldung zweimal.
 */

export type ToastMessage = { text: string; id: number };

/** So lange steht die Meldung, danach verschwindet sie von selbst. */
export const TOAST_MS = 2500;

let current: ToastMessage | null = null;
let count = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function toast(text: string): void {
  count += 1;
  current = { text, id: count };
  emit();
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, TOAST_MS);
}

/** Nur für Tests: räumt eine laufende Meldung samt Zeitgeber weg. */
export function clearToast(): void {
  clearTimeout(timer);
  current = null;
  emit();
}

export function useToastMessage(): ToastMessage | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
}
