import { dogFormFrom, dogInputFrom, emptyDogForm } from '../dog-form';

describe('Formular Hund', () => {
  it('macht aus den Texten eine gültige Eingabe', () => {
    const result = dogInputFrom({
      ...emptyDogForm(),
      name: 'Bäri',
      birthDate: '14.05.2021',
      chipNumber: '756 0981 2345 6789',
      sex: 'male',
    });
    expect(result.errors).toBeNull();
    expect(result.input).toMatchObject({ name: 'Bäri', birthDate: '2021-05-14', sex: 'male' });
  });

  it('sagt je Feld in einem Satz, was nicht stimmt', () => {
    const result = dogInputFrom({
      ...emptyDogForm(),
      name: '  ',
      birthDate: '31.02.2021',
      birthYear: '21',
      chipNumber: '123',
    });
    expect(result.errors).toEqual({
      name: 'Gib deinem Hund einen Namen.',
      birthDate: 'Schreib das Datum so: 22.09.2026.',
      birthYear: 'Gib ein Jahr zwischen 1980 und heute an.',
      chipNumber: 'Eine Chipnummer hat 15 Ziffern, etwa 756 0981 2345 6789.',
    });
  });

  it('füllt das Formular aus einem gespeicherten Hund', () => {
    const form = dogFormFrom({
      id: 'x',
      name: 'Mila',
      birthDate: '2024-03-01',
      birthYear: null,
      breed: 'Galga',
      sex: 'female',
      neutered: true,
      colorMarkings: null,
      chipNumber: '756098123456789',
      amicusRegistered: true,
      insuranceName: null,
      insurancePolicy: null,
      insurancePhone: null,
      vetName: null,
      vetPhone: null,
      vetAddress: null,
      food: null,
      allergies: null,
      careNotes: null,
      archivedAt: null,
      createdAt: 'x',
      updatedAt: 'x',
    });
    expect(form).toMatchObject({ name: 'Mila', birthDate: '01.03.2024', breed: 'Galga', food: '' });
  });
});
