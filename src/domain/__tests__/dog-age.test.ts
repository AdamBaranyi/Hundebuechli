import { ageOf } from '../dog-age';

const TODAY = '2026-09-22';

describe('Alter des Hundes', () => {
  it('rechnet aus dem Geburtsdatum Jahre und Monate', () => {
    expect(ageOf({ birthDate: '2021-09-22', birthYear: null }, TODAY)).toEqual({
      years: 5,
      months: 0,
    });
    expect(ageOf({ birthDate: '2021-09-23', birthYear: null }, TODAY)).toEqual({
      years: 4,
      months: 11,
    });
    expect(ageOf({ birthDate: '2026-01-10', birthYear: null }, TODAY)).toEqual({
      years: 0,
      months: 8,
    });
  });

  it('bleibt mit nur einem Geburtsjahr bei Jahren', () => {
    expect(ageOf({ birthDate: null, birthYear: 2024 }, TODAY)).toEqual({ years: 2, months: null });
  });

  it('kennt kein Alter ohne Angabe oder für die Zukunft', () => {
    expect(ageOf({ birthDate: null, birthYear: null }, TODAY)).toBeNull();
    expect(ageOf({ birthDate: '2027-01-01', birthYear: null }, TODAY)).toBeNull();
    expect(ageOf({ birthDate: null, birthYear: 2030 }, TODAY)).toBeNull();
  });
});
