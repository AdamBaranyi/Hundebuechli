import { formatLocal, parseInputDate } from '@/content/format';
import { validationMessage } from '@/content/validation';
import type { Medication } from '@/db/repositories/medications';
import type { LocalDate } from '@/domain/local-date';
import { type MedicationInput, medicationInputSchema } from '@/domain/medication';

export type MedicationFormState = {
  dogId: string | null;
  name: string;
  dose: string;
  /** Minuten seit Mitternacht, aufsteigend. */
  times: number[];
  startText: string;
  endText: string;
  active: boolean;
};

export type MedicationFormErrors = Partial<
  Record<'dogId' | 'name' | 'dose' | 'times' | 'startDate' | 'endDate', string>
>;

export function emptyMedicationForm(dogId: string | null, today: LocalDate): MedicationFormState {
  return {
    dogId,
    name: '',
    dose: '',
    times: [480],
    startText: formatLocal.input(today),
    endText: '',
    active: true,
  };
}

export function medicationFormFrom(medication: Medication): MedicationFormState {
  return {
    dogId: medication.dogId,
    name: medication.name,
    dose: medication.dose,
    times: medication.times,
    startText: formatLocal.input(medication.startDate),
    endText: medication.endDate ? formatLocal.input(medication.endDate) : '',
    active: medication.active,
  };
}

/** Uhrzeit dazu oder weg; doppelte fallen weg, sortiert wird aufsteigend. */
export function toggleTime(times: readonly number[], minute: number): number[] {
  const without = times.filter((time) => time !== minute);
  const next = without.length === times.length ? [...times, minute] : without;
  return [...new Set(next)].sort((a, b) => a - b);
}

/** Liest «8:00» oder «08:00»; gibt Minuten seit Mitternacht zurück oder null. */
export function parseTime(text: string): number | null {
  const match = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(text);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function medicationInputFrom(
  form: MedicationFormState,
): { input: MedicationInput; errors: null } | { input: null; errors: MedicationFormErrors } {
  const errors: MedicationFormErrors = {};
  const startDate = parseInputDate(form.startText);
  if (!startDate) errors.startDate = validationMessage('startDate', 'invalid_date');
  const endDate = form.endText.trim() === '' ? null : parseInputDate(form.endText);
  if (form.endText.trim() !== '' && !endDate) {
    errors.endDate = validationMessage('endDate', 'invalid_date');
  }

  const candidate: MedicationInput = {
    dogId: form.dogId ?? '',
    name: form.name,
    dose: form.dose,
    times: form.times,
    startDate: startDate ?? '',
    endDate,
    active: form.active,
  };
  const parsed = medicationInputSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = String(issue.path[0] ?? '');
      const field = path as keyof MedicationFormErrors;
      if (errors[field]) continue;
      errors[field] = validationMessage(path, issue.message);
    }
  }
  return Object.keys(errors).length > 0
    ? { input: null, errors }
    : { input: candidate, errors: null };
}
