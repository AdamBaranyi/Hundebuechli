import { contrastRatio } from '../contrast';
import { colors, type ColorName, MIN_FONT_SIZE, touch, typeScale } from '../tokens';

const TEXT = 4.5; // Text
const UI = 3; // Bedienelemente und Feldkanten

/** Paare aus Vordergrund, Hintergrund und nötigem Kontrast. */
const PAIRS: [ColorName, ColorName, number][] = [
  ['graphite', 'sheet', TEXT],
  ['graphite', 'pebble', TEXT],
  ['pencil', 'sheet', TEXT],
  ['pencil', 'pebble', TEXT],
  ['carmine', 'sheet', TEXT],
  ['carmine', 'pebble', TEXT],
  ['onGraphite', 'graphite', TEXT],
  ['graphite', 'pressed', TEXT],
  ['pencil', 'pressed', TEXT],
  ['fieldBorder', 'sheet', UI],
];

describe.each(['light', 'dark'] as const)('Farben im %s-Modus', (scheme) => {
  it.each(PAIRS)('%s auf %s erreicht den nötigen Kontrast', (fg, bg, needed) => {
    expect(contrastRatio(colors[scheme][fg], colors[scheme][bg])).toBeGreaterThanOrEqual(needed);
  });
});

describe('Kontrast-Rechnung', () => {
  it('stimmt mit bekannten Werten überein', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    // Aus DESIGN.md: Graphit auf Blatt 15,8:1, Karmin auf Blatt 6,5:1.
    expect(contrastRatio(colors.light.graphite, colors.light.sheet)).toBeCloseTo(15.8, 1);
    expect(contrastRatio(colors.light.carmine, colors.light.sheet)).toBeCloseTo(6.5, 1);
  });
});

describe('Schrift und Tippflächen', () => {
  it('hat keine Stufe unter 16 pt', () => {
    for (const step of Object.values(typeScale)) {
      expect(step.fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
      expect(step.lineHeight).toBeGreaterThan(step.fontSize);
    }
  });

  it('baut Tippflächen ab 48, Hauptaktionen ab 56', () => {
    expect(touch.min).toBeGreaterThanOrEqual(48);
    expect(touch.primary).toBeGreaterThanOrEqual(56);
    expect(touch.stamp).toBeGreaterThanOrEqual(48);
  });
});
