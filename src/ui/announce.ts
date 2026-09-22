import { useSyncExternalStore } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/*
 * Ansagen nach Sichern, Erledigen und Löschen. Auf dem Gerät spricht sie
 * VoiceOver oder TalkBack; im Browser gibt es dafür keine Schnittstelle
 * (react-native-web lässt sie leer), dort übernimmt ein Live-Bereich.
 */

let current = '';
const listeners = new Set<() => void>();

export function announce(text: string): void {
  if (Platform.OS !== 'web') {
    AccessibilityInfo.announceForAccessibility(text);
    return;
  }
  // Erst leeren, dann setzen: So wird auch derselbe Satz ein zweites Mal gelesen.
  current = '';
  listeners.forEach((listener) => listener());
  setTimeout(() => {
    current = text;
    listeners.forEach((listener) => listener());
  }, 50);
}

export function useAnnouncement(): string {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
}
