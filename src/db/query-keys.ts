/**
 * Schlüssel für TanStack Query an einem Ort. Nach einer Änderung wird gezielt
 * invalidiert; die Übersicht «Als Nächstes» lädt ihre Liste erst neu, wenn sie
 * wieder geöffnet wird, damit nichts unter dem Finger wegspringt.
 */
export const queryKeys = {
  dogs: ['dogs'] as const,
  dogList: (includeArchived: boolean) => ['dogs', 'list', includeArchived] as const,
  dogCount: ['dogs', 'count'] as const,
  dog: (id: string) => ['dogs', 'one', id] as const,
  dogData: (id: string) => ['dogs', 'data', id] as const,
  health: ['health'] as const,
  healthOfDog: (dogId: string) => ['health', 'dog', dogId] as const,
  healthEntry: (id: string) => ['health', 'entry', id] as const,
  recentProducts: (dogId: string, kind: string) => ['health', 'products', dogId, kind] as const,
  openDue: ['open-due'] as const,
  settings: ['settings'] as const,
};
