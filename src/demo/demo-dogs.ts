import { addMonths } from '@/domain/calendar';
import type { DogInput } from '@/domain/dog';
import type { LocalDate } from '@/domain/local-date';

/** Feste Kennungen: So lassen sich die Beispielhunde später gezielt entfernen. */
export const BAERI_ID = '0b7e5a0e-5d1a-4f0b-9a3e-5a3b1e000001';
export const MILA_ID = '0b7e5a0e-5d1a-4f0b-9a3e-5a3b1e000002';

/** Die erfundene Praxis; die Nummer ist erkennbar ungültig. */
export const PRACTICE = {
  vetName: 'Tierarztpraxis Rehbach',
  vetPhone: '000 000 00 00',
  vetAddress: 'Rehbachweg 1, 0000 Beispielhausen',
} as const;

export function BAERI(today: LocalDate): DogInput {
  return {
    name: 'Bäri',
    breed: 'Whippet',
    sex: 'male',
    neutered: true,
    birthDate: addMonths(today, -62),
    colorMarkings: 'rehbraun gestromt, helle Brust',
    chipNumber: '756000000000001',
    amicusRegistered: true,
    insuranceName: 'Beispiel Tierversicherung',
    insurancePolicy: 'B-0000-0001',
    insurancePhone: '000 000 00 01',
    food: 'Morgens und abends je 110 g Trockenfutter, abends ein Löffel Quark.',
    careNotes:
      'Scheu bei Fremden: nicht rufen und nicht nachrennen. Im Winter mit Mantel. Schläft am liebsten unter der Decke.',
  };
}

export function MILA(today: LocalDate): DogInput {
  return {
    name: 'Mila',
    breed: 'Galga (Galgo Español)',
    sex: 'female',
    neutered: true,
    birthDate: addMonths(today, -26),
    colorMarkings: 'gestromt, weisses Gesicht und weisse Brust',
    chipNumber: '756000000000002',
    amicusRegistered: true,
    insuranceName: 'Beispiel Tierversicherung',
    insurancePolicy: 'B-0000-0002',
    insurancePhone: '000 000 00 01',
    food: 'Morgens und abends je 170 g Trockenfutter, eingeweicht.',
    allergies: 'Verdacht auf Umweltallergie (Gräser)',
    careNotes:
      'Aus dem Tierschutz, seit einem Jahr bei uns. Erschrickt bei lauten Geräuschen. An der Leine sicher, ohne Leine nur im eingezäunten Feld.',
  };
}
