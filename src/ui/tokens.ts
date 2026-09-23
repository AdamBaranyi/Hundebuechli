/**
 * Gestaltungswerte aus dem freigegebenen Entwurf (docs/DESIGN.md,
 * Vorlage css/tokens.css). Die deutschen Namen des Entwurfs stehen daneben.
 * Kontraste und Schriftgrössen prüft src/ui/__tests__/tokens.test.ts.
 */

export const colors = {
  light: {
    pebble: '#EEF0EC', // Kiesel: Grund der App
    sheet: '#FFFFFF', // Blatt: Flächen mit Zeilen
    graphite: '#1D2420', // Graphit: Text, Hauptaktion, Stempel
    pencil: '#59625C', // Bleistift: Nebentext
    fieldBorder: '#858E88', // Feldrand: Kanten von Feldern und Knöpfen
    line: '#DCE0DA', // Linie: Trennlinien, nur Schmuck
    carmine: '#B3223F', // Karmin: Marke, «fällig», «überfällig»
    onGraphite: '#FFFFFF', // Schrift auf Graphit
    pressed: '#E6E9E4', // Gedrückt
    glass: 'rgba(255, 255, 255, 0.9)', // Glas der eigenen Tab-Leiste im Browser
    glassEdge: 'rgba(29, 36, 32, 0.08)',
  },
  dark: {
    pebble: '#000000',
    sheet: '#1B1D1B',
    graphite: '#F1F3EF',
    pencil: '#A9B0AA',
    fieldBorder: '#7D857F',
    line: '#2F332F',
    carmine: '#F76E82',
    onGraphite: '#000000',
    pressed: '#2A2D2A',
    glass: 'rgba(28, 30, 28, 0.92)',
    glassEdge: 'rgba(241, 243, 239, 0.1)',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorName = keyof (typeof colors)['light'];
export type Palette = Record<ColorName, string>;

/** Atkinson Hyperlegible Next, je Schnitt eine Datei (assets/fonts). */
export const fontFiles = {
  'AtkinsonHyperlegibleNext-Regular': require('../../assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'),
  'AtkinsonHyperlegibleNext-Medium': require('../../assets/fonts/AtkinsonHyperlegibleNext-Medium.ttf'),
  'AtkinsonHyperlegibleNext-Bold': require('../../assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf'),
  'AtkinsonHyperlegibleNext-ExtraBold': require('../../assets/fonts/AtkinsonHyperlegibleNext-ExtraBold.ttf'),
} as const;

/**
 * Der Schnitt steckt im Namen der Schrift, nicht in fontWeight: Android
 * fällt sonst bei eigenen Schriften auf die Systemschrift zurück.
 */
export const fontFamily = {
  regular: 'AtkinsonHyperlegibleNext-Regular',
  medium: 'AtkinsonHyperlegibleNext-Medium',
  bold: 'AtkinsonHyperlegibleNext-Bold',
  extraBold: 'AtkinsonHyperlegibleNext-ExtraBold',
} as const satisfies Record<string, keyof typeof fontFiles>;

export type FontWeight = keyof typeof fontFamily;

/** Schriftstufen in pt. Nebentext mit 16 ist die Untergrenze. */
export const typeScale = {
  display: { fontSize: 48, lineHeight: 52, weight: 'extraBold' }, // Anzeige
  largeTitle: { fontSize: 32, lineHeight: 38, weight: 'extraBold' }, // Grosser Titel
  title: { fontSize: 24, lineHeight: 30, weight: 'bold' }, // Titel
  subtitle: { fontSize: 20, lineHeight: 26, weight: 'bold' }, // Zwischentitel
  body: { fontSize: 17, lineHeight: 24, weight: 'regular' }, // Text
  secondary: { fontSize: 16, lineHeight: 22, weight: 'regular' }, // Nebentext
} as const satisfies Record<string, { fontSize: number; lineHeight: number; weight: FontWeight }>;

export type TypeVariant = keyof typeof typeScale;

export const MIN_FONT_SIZE = 16;

/** Raster von 4 pt. */
export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
  edge: 16, // Seitenrand
  section: 32, // Abstand zwischen Abschnitten
} as const;

/** Platz unter dem Inhalt für die schwebende Tab-Leiste. */
export const tabBarSpace = 96;

/** Radien nach Rang, nicht einer für alles. */
export const radius = {
  sheet: 20,
  photo: 24,
  field: 14,
  capsule: 999,
} as const;

/** Tippflächen: überall ab 48, Hauptaktionen 56 (Auftrag, Abschnitt 10). */
export const touch = {
  min: 48,
  primary: 56,
  stamp: 56,
} as const;

/** Der einzige bewegte Moment: der Stempel (DESIGN.md, Bewegung). */
export const motion = {
  stampMs: 200,
  awayMs: 150,
  pressMs: 120,
  easeOut: [0.23, 1, 0.32, 1] as const,
} as const;

/** Breite des Inhalts auf grossen Bildschirmen (Web-Vorschau, Tablet). */
export const CONTENT_MAX_WIDTH = 560;
