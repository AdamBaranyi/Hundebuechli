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
  medications: ['medications'] as const,
  medicationsOfDog: (dogId: string) => ['medications', 'dog', dogId] as const,
  medication: (id: string) => ['medications', 'one', id] as const,
  doseSlots: (date: string) => ['medications', 'slots', date] as const,
  diary: ['diary'] as const,
  diaryOfDog: (dogId: string) => ['diary', 'dog', dogId] as const,
  diaryEntry: (id: string) => ['diary', 'entry', id] as const,
  documents: ['documents'] as const,
  documentsOfDog: (dogId: string) => ['documents', 'dog', dogId] as const,
  document: (id: string) => ['documents', 'one', id] as const,
  weights: ['weights'] as const,
  weightsOfDog: (dogId: string) => ['weights', 'dog', dogId] as const,
  settings: ['settings'] as const,
  owner: ['owner'] as const,
};
