/**
 * @jest-environment node
 */
import { formatTimeInput } from '../time-input';

/** Tippen heisst: Ziffer für Ziffer durch die Formatierung. */
function type(digits: string): string {
  return [...digits].reduce((shown, digit) => formatTimeInput(shown + digit), '');
}

/** Rücktaste heisst: das letzte Zeichen weg, dann wieder formatieren. */
function backspace(shown: string): string {
  return formatTimeInput(shown.slice(0, -1));
}

describe('Uhrzeit tippen', () => {
  it('setzt den Doppelpunkt selbst', () => {
    expect(type('1830')).toBe('18:30');
    expect(type('0700')).toBe('07:00');
    expect(type('2359')).toBe('23:59');
  });

  it('erkennt eine einstellige Stunde an der ersten Ziffer', () => {
    expect(type('930')).toBe('9:30');
    expect(type('8')).toBe('8');
    expect(type('800')).toBe('8:00');
  });

  it('wartet bei zweistelliger Stunde auf die Minuten', () => {
    expect(type('1')).toBe('1');
    expect(type('18')).toBe('18');
    expect(type('183')).toBe('18:3');
  });

  it('löscht Ziffer für Ziffer', () => {
    expect(backspace('18:30')).toBe('18:3');
    expect(backspace('18:3')).toBe('18');
    expect(backspace('18')).toBe('1');
    expect(backspace('1')).toBe('');
  });

  it('nimmt Eingefügtes an und wirft Zeichen weg, die nicht dazugehören', () => {
    expect(formatTimeInput('18:30')).toBe('18:30');
    expect(formatTimeInput('18.30 Uhr')).toBe('18:30');
    expect(formatTimeInput('abc')).toBe('');
    expect(formatTimeInput('183045')).toBe('18:30');
  });
});
