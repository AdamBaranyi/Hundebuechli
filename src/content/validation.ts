/**
 * Was die Prüfung meldet, in Sätzen, die sagen, was zu tun ist. Die Regeln
 * stehen in src/domain; dort tragen die Fehler nur Kürzel.
 */
const MESSAGES: Record<string, string> = {
  required: 'Bitte ausfüllen.',
  too_long: 'Das ist zu lang. Kürz es bitte etwas.',
  invalid_date: 'Schreib das Datum so: 22.09.2026.',
  chip_invalid: 'Eine Chipnummer hat 15 Ziffern, etwa 756 0981 2345 6789.',
  year_invalid: 'Gib ein Jahr zwischen 1980 und heute an.',
  due_before_date: 'Die nächste Fälligkeit liegt nach dem Datum des Eintrags.',
  email_invalid: 'Das sieht nicht nach einer E-Mail-Adresse aus.',
  weight_invalid: 'Gib das Gewicht in Kilogramm an, etwa 13,8.',
  invalid_time: 'Schreib die Uhrzeit so: 18:30.',
};

/** Besondere Sätze für einzelne Felder, wo der allgemeine zu knapp wäre. */
const FIELD_MESSAGES: Record<string, Record<string, string>> = {
  name: { required: 'Gib deinem Hund einen Namen.' },
  dogId: { required: 'Wähle, für welchen Hund der Eintrag ist.' },
  kind: { required: 'Wähle die Art des Eintrags.' },
  category: { required: 'Wähle, worum es geht.' },
  documentCategory: { required: 'Wähle die Art des Dokuments.' },
  title: { required: 'Gib dem Dokument einen Titel.' },
  ownerName: { required: 'Gib deinen Namen an, damit man weiss, wen man anruft.' },
  text: { required: 'Schreib, was dir aufgefallen ist.' },
};

export function validationMessage(field: string, code: string): string {
  return FIELD_MESSAGES[field]?.[code] ?? MESSAGES[code] ?? 'Bitte prüfe diese Angabe.';
}
