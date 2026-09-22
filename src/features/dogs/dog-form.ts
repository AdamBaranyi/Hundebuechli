import { formatLocal, parseInputDate } from '@/content/format';
import { validationMessage } from '@/content/validation';
import type { Dog } from '@/db/repositories/dogs';
import { type DogInput, dogInputSchema } from '@/domain/dog';

/** Das Formular hält Texte, so wie sie getippt werden; geprüft wird beim Sichern. */
export type DogFormState = {
  name: string;
  birthDate: string;
  birthYear: string;
  breed: string;
  sex: 'male' | 'female' | null;
  neutered: boolean;
  colorMarkings: string;
  chipNumber: string;
  amicusRegistered: boolean;
  vetName: string;
  vetPhone: string;
  vetAddress: string;
  insuranceName: string;
  insurancePolicy: string;
  insurancePhone: string;
  food: string;
  allergies: string;
  careNotes: string;
};

export type DogFormErrors = Partial<Record<keyof DogFormState, string>>;

const TEXT_FIELDS = [
  'name',
  'breed',
  'colorMarkings',
  'chipNumber',
  'vetName',
  'vetPhone',
  'vetAddress',
  'insuranceName',
  'insurancePolicy',
  'insurancePhone',
  'food',
  'allergies',
  'careNotes',
] as const;

export function emptyDogForm(): DogFormState {
  return {
    ...(Object.fromEntries(TEXT_FIELDS.map((field) => [field, ''])) as Record<
      (typeof TEXT_FIELDS)[number],
      string
    >),
    birthDate: '',
    birthYear: '',
    sex: null,
    neutered: false,
    amicusRegistered: false,
  };
}

export function dogFormFrom(dog: Dog): DogFormState {
  const form = emptyDogForm();
  for (const field of TEXT_FIELDS) form[field] = dog[field] ?? '';
  return {
    ...form,
    birthDate: dog.birthDate ? formatLocal.input(dog.birthDate) : '',
    birthYear: dog.birthYear ? String(dog.birthYear) : '',
    sex: dog.sex,
    neutered: dog.neutered,
    amicusRegistered: dog.amicusRegistered,
  };
}

/**
 * Macht aus den Texten des Formulars eine Eingabe für das Repository, oder
 * sagt je Feld in einem Satz, was nicht stimmt.
 */
export function dogInputFrom(
  form: DogFormState,
): { input: DogInput; errors: null } | { input: null; errors: DogFormErrors } {
  const errors: DogFormErrors = {};
  const birthDate = form.birthDate.trim() ? parseInputDate(form.birthDate) : null;
  if (form.birthDate.trim() && !birthDate) {
    errors.birthDate = validationMessage('birthDate', 'invalid_date');
  }
  const year = form.birthYear.trim();
  const birthYear = /^\d{4}$/.test(year) ? Number(year) : null;
  if (year && birthYear === null) errors.birthYear = validationMessage('birthYear', 'year_invalid');

  const candidate: DogInput = {
    ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, form[field]])),
    name: form.name,
    birthDate,
    birthYear,
    sex: form.sex,
    neutered: form.neutered,
    amicusRegistered: form.amicusRegistered,
  };
  const parsed = dogInputSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '') as keyof DogFormState;
      errors[field] ??= validationMessage(field, issue.message);
    }
  }
  return Object.keys(errors).length > 0
    ? { input: null, errors }
    : { input: candidate, errors: null };
}
