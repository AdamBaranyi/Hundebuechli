/**
 * @jest-environment node
 */
import { buildCurve, changeSincePrevious, parseKilograms } from '../weight';

describe('Gewicht eingeben', () => {
  it('liest Kilogramm mit Komma oder Punkt', () => {
    expect(parseKilograms('13,8')).toBe(13800);
    expect(parseKilograms('13.8')).toBe(13800);
    expect(parseKilograms('13')).toBe(13000);
    expect(parseKilograms(' 7,25 ')).toBe(7250);
  });

  it('weist zurück, was kein Gewicht ist', () => {
    expect(parseKilograms('')).toBeNull();
    expect(parseKilograms('schwer')).toBeNull();
    expect(parseKilograms('13,8 kg')).toBeNull();
    expect(parseKilograms('0')).toBeNull();
  });
});

describe('Veränderung', () => {
  const points = [
    { date: '2026-06-20', grams: 13200 },
    { date: '2026-09-22', grams: 13800 },
  ];

  it('nennt Betrag und Richtung zum vorherigen Wert', () => {
    expect(changeSincePrevious(points)).toEqual({
      grams: 600,
      direction: 'more',
      since: '2026-06-20',
    });
  });

  it('zählt auch abwärts und gleich', () => {
    expect(
      changeSincePrevious(
        [...points].reverse().map((p, i) => ({ ...p, date: `2026-0${i + 6}-01` })),
      )?.direction,
    ).toBe('less');
    expect(
      changeSincePrevious([
        { date: '2026-06-20', grams: 13200 },
        { date: '2026-09-22', grams: 13200 },
      ])?.direction,
    ).toBe('same');
  });

  it('hat ohne Vorgänger nichts zu vergleichen', () => {
    expect(changeSincePrevious([points[0]!])).toBeNull();
    expect(changeSincePrevious([])).toBeNull();
  });
});

describe('Kurve', () => {
  it('legt die Punkte über die Breite und den höchsten Wert nach oben', () => {
    const curve = buildCurve(
      [
        { date: '2026-01-01', grams: 12000 },
        { date: '2026-02-01', grams: 14000 },
        { date: '2026-03-01', grams: 13000 },
      ],
      224,
      200,
      12,
    );
    expect(curve.points.map((point) => point.x)).toEqual([12, 112, 212]);
    expect(curve.points[1]?.y).toBe(12);
    expect(curve.points[0]?.y).toBe(188);
    expect(curve.points[2]?.y).toBeCloseTo(100);
  });

  it('sortiert nach Datum, egal wie die Werte kommen', () => {
    const curve = buildCurve(
      [
        { date: '2026-03-01', grams: 13000 },
        { date: '2026-01-01', grams: 12000 },
      ],
      100,
      100,
      10,
    );
    expect(curve.points.map((point) => point.point.date)).toEqual(['2026-01-01', '2026-03-01']);
  });

  it('stellt einen einzelnen Wert in die Mitte', () => {
    const curve = buildCurve([{ date: '2026-01-01', grams: 12000 }], 200, 100, 10);
    expect(curve.points[0]?.x).toBe(100);
    expect(Number.isFinite(curve.points[0]?.y)).toBe(true);
  });

  it('teilt nicht durch null, wenn alle Werte gleich sind', () => {
    const curve = buildCurve(
      [
        { date: '2026-01-01', grams: 12000 },
        { date: '2026-02-01', grams: 12000 },
      ],
      200,
      100,
      10,
    );
    expect(curve.points.every((point) => Number.isFinite(point.y))).toBe(true);
    expect(curve.points[0]?.y).toBe(curve.points[1]?.y);
  });
});
