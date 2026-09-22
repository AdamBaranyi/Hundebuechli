import { formatLocal, parseInputDate } from '@/content/format';
import { validationMessage } from '@/content/validation';
import type { HealthEntry } from '@/db/repositories/health';
import { addDays, addMonths } from '@/domain/calendar';
import {
  type HealthEntryInput,
  healthEntryInputSchema,
  type HealthKind,
  REPEAT_CHOICES,
} from '@/domain/health';
import type { LocalDate } from '@/domain/local-date';

export type DateChoice = 'today' | 'yesterday' | 'other';
export type DueChoice = 'none' | 'date' | `${(typeof REPEAT_CHOICES)[number]}`;

export type HealthFormState = {
  dogId: string | null;
  kind: HealthKind | null;
  dateChoice: DateChoice;
  dateText: string;
  product: string;
  dueChoice: DueChoice;
  dueText: string;
  note: string;
};

export type HealthFormErrors = Partial<
  Record<'dogId' | 'kind' | 'date' | 'due' | 'product' | 'note', string>
>;

export function emptyHealthForm(dogId: string | null, kind: HealthKind | null): HealthFormState {
  return {
    dogId,
    kind,
    dateChoice: 'today',
    dateText: '',
    product: '',
    dueChoice: 'none',
    dueText: '',
    note: '',
  };
}

export function healthFormFrom(entry: HealthEntry, today: LocalDate): HealthFormState {
  const dateChoice: DateChoice =
    entry.date === today ? 'today' : entry.date === addDays(today, -1) ? 'yesterday' : 'other';
  const repeat = entry.repeatMonths;
  const matchesRepeat =
    repeat !== null &&
    (REPEAT_CHOICES as readonly number[]).includes(repeat) &&
    entry.nextDueDate === addMonths(entry.date, repeat);
  return {
    dogId: entry.dogId,
    kind: entry.kind,
    dateChoice,
    dateText: dateChoice === 'other' ? formatLocal.input(entry.date) : '',
    product: entry.product ?? '',
    dueChoice: matchesRepeat ? (String(repeat) as DueChoice) : entry.nextDueDate ? 'date' : 'none',
    dueText: !matchesRepeat && entry.nextDueDate ? formatLocal.input(entry.nextDueDate) : '',
    note: entry.note ?? '',
  };
}

/** Das Datum des Eintrags aus der Schnellwahl oder dem Feld; null, wenn es nicht stimmt. */
export function entryDate(form: HealthFormState, today: LocalDate): LocalDate | null {
  if (form.dateChoice === 'today') return today;
  if (form.dateChoice === 'yesterday') return addDays(today, -1);
  return parseInputDate(form.dateText);
}

/** Nächste Fälligkeit und Wiederholung aus der Schnellwahl. */
export function nextDue(
  form: HealthFormState,
  date: LocalDate | null,
): { nextDueDate: LocalDate | null; repeatMonths: number | null; valid: boolean } {
  if (form.dueChoice === 'none') return { nextDueDate: null, repeatMonths: null, valid: true };
  if (form.dueChoice === 'date') {
    const parsed = parseInputDate(form.dueText);
    return { nextDueDate: parsed, repeatMonths: null, valid: parsed !== null };
  }
  const months = Number(form.dueChoice);
  return { nextDueDate: date ? addMonths(date, months) : null, repeatMonths: months, valid: true };
}

export function healthInputFrom(
  form: HealthFormState,
  today: LocalDate,
): { input: HealthEntryInput; errors: null } | { input: null; errors: HealthFormErrors } {
  const errors: HealthFormErrors = {};
  const date = entryDate(form, today);
  if (!date) errors.date = validationMessage('date', 'invalid_date');
  const due = nextDue(form, date);
  if (!due.valid) errors.due = validationMessage('due', 'invalid_date');

  const candidate: HealthEntryInput = {
    dogId: form.dogId ?? '',
    kind: form.kind ?? ('' as HealthKind),
    date: date ?? '',
    product: form.product,
    note: form.note,
    nextDueDate: due.nextDueDate,
    repeatMonths: due.repeatMonths,
  };
  const parsed = healthEntryInputSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = String(issue.path[0] ?? '');
      const field = (path === 'nextDueDate' ? 'due' : path) as keyof HealthFormErrors;
      if (field === 'date' && errors.date) continue;
      errors[field] ??= validationMessage(path, issue.message);
    }
  }
  return Object.keys(errors).length > 0
    ? { input: null, errors }
    : { input: candidate, errors: null };
}
