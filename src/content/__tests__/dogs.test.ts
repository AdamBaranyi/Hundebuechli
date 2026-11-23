import { dogsText } from '../dogs';

describe('dogsText.profile.yearRow', () => {
  it('nennt den sichtbaren Text zuerst und am Stück (WCAG 2.5.3)', () => {
    const name = dogsText.profile.yearRow('Impfung', ['Oktober'], 'nächste am 22.10.');
    expect(name).toBe('Impfung: nächste am 22.10. Erledigt im Oktober. Geschichte öffnen.');
  });

  it('schliesst eine Fälligkeit ohne Tag mit einem Punkt ab', () => {
    const name = dogsText.profile.yearRow('Impfung', [], 'nächste im April 2027');
    expect(name).toBe(
      'Impfung: nächste im April 2027. In diesem Jahr nichts erledigt. Geschichte öffnen.',
    );
  });

  it('kommt ohne Fälligkeit aus', () => {
    const name = dogsText.profile.yearRow('Tierarztbesuch', ['September'], null);
    expect(name).toBe('Tierarztbesuch: Erledigt im September. Geschichte öffnen.');
  });
});
