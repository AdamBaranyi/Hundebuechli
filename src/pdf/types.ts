/*
 * Was die Vorlagen brauchen, schon als fertige Texte: Die Vorlagen setzen nur
 * noch zusammen und maskieren. Formatiert wird vorher (src/pdf/collect.ts).
 * Fotos stehen als Base64 darin, nicht als Pfad.
 */

export type PdfFact = { label: string; value: string };

export type PdfDog = {
  name: string;
  /** «Whippet, Rüde, kastriert, 5 Jahre» */
  subtitle: string;
  facts: PdfFact[];
  photo: string | null;
};

export type PdfMedication = { name: string; detail: string };

export type VetPdfData = {
  dog: PdfDog;
  medications: PdfMedication[];
  health: { kind: string; date: string; product: string; next: string; due: boolean }[];
  weights: { date: string; weight: string; difference: string }[];
  /** Kleine Kurve als SVG, ohne Adressen nach aussen. */
  weightCurve: string | null;
  diaryPeriod: string;
  diary: { when: string; category: string; text: string; photos: string[] }[];
};

export type SitterPdfData = {
  dog: PdfDog;
  food: string | null;
  medications: PdfMedication[];
  care: string | null;
  allergies: string | null;
  vet: PdfFact[];
  owner: PdfFact[];
};

export type PosterPdfData = {
  name: string;
  photo: string | null;
  /** Rasse, Farbe und Merkmale, Geschlecht – je eine Zeile. */
  description: string[];
  chip: string | null;
  lastSeen: string;
  phone: string;
};
