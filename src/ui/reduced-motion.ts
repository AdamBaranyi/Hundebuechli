import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

/*
 * «Bewegung reduzieren» aus den Einstellungen des Geräts. Als kleiner Speicher
 * ausserhalb von React: Der Wert kommt asynchron und kann sich jederzeit
 * ändern, und Effekte dürfen keinen Zustand setzen.
 */

let reduced = false;
let started = false;
const listeners = new Set<() => void>();

function set(value: boolean): void {
  if (value === reduced) return;
  reduced = value;
  listeners.forEach((listener) => listener());
}

function start(): void {
  if (started) return;
  started = true;
  void AccessibilityInfo.isReduceMotionEnabled().then(set, () => undefined);
  AccessibilityInfo.addEventListener('reduceMotionChanged', set);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (listener) => {
      start();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => reduced,
  );
}
