import { formatDateInput } from '../date-input';

describe('Datum tippen', () => {
  it('setzt die Punkte, sobald genug Ziffern da sind', () => {
    expect(formatDateInput('2')).toBe('2');
    expect(formatDateInput('29')).toBe('29');
    expect(formatDateInput('290')).toBe('29.0');
    expect(formatDateInput('2905')).toBe('29.05');
    expect(formatDateInput('290520')).toBe('29.05.20');
    expect(formatDateInput('29052022')).toBe('29.05.2022');
  });

  it('lässt die Rücktaste wirken, statt den Punkt wieder zu setzen', () => {
    expect(formatDateInput('29.05.2')).toBe('29.05.2');
    expect(formatDateInput('29.05.')).toBe('29.05');
    expect(formatDateInput('29.0')).toBe('29.0');
    expect(formatDateInput('29.')).toBe('29');
    expect(formatDateInput('')).toBe('');
  });

  it('nimmt auch Eingefügtes und wirft Überzähliges weg', () => {
    expect(formatDateInput('29.05.2022')).toBe('29.05.2022');
    expect(formatDateInput('29/05/2022')).toBe('29.05.2022');
    expect(formatDateInput('2905202233')).toBe('29.05.2022');
    expect(formatDateInput('abc')).toBe('');
  });
});
