import { chipCountryCode, formatChipNumber, isValidChipNumber, normalizeChipNumber } from '../chip';

describe('Chipnummer', () => {
  it('entfernt Leerzeichen und Bindestriche', () => {
    expect(normalizeChipNumber(' 756 0981-2345 6789 ')).toBe('756098123456789');
  });

  it('verlangt genau 15 Ziffern', () => {
    expect(isValidChipNumber('756098123456789')).toBe(true);
    expect(isValidChipNumber('75609812345678')).toBe(false);
    expect(isValidChipNumber('7560981234567890')).toBe(false);
    expect(isValidChipNumber('75609812345678x')).toBe(false);
  });

  it('nennt die Schweiz nur bei 756 und rät sonst nichts', () => {
    expect(chipCountryCode('756098123456789')).toBe('CH');
    expect(chipCountryCode('276098123456789')).toBeNull();
    expect(chipCountryCode('900098123456789')).toBeNull();
    expect(chipCountryCode('756')).toBeNull();
  });

  it('gruppiert 3-4-4-4 wie im Heimtierausweis', () => {
    expect(formatChipNumber('756098123456789')).toBe('756 0981 2345 6789');
    expect(formatChipNumber('12345')).toBe('12345');
  });
});
