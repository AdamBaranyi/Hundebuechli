import { buildCurve, type WeightPoint } from '@/domain/weight';
import { colors } from '@/ui/tokens';

const WIDTH = 480;
const HEIGHT = 110;

/**
 * Die kleine Kurve im Tierarzt-PDF als SVG: dieselbe Rechnung wie in der App,
 * eine Linie, Punkte, drei Haarlinien. Nur Zahlen und Farben aus den Tokens,
 * keine Texte aus den Daten – darum muss hier nichts maskiert werden.
 */
export function weightCurveSvg(points: readonly WeightPoint[]): string | null {
  if (points.length < 2) return null;
  const ink = colors.light;
  const curve = buildCurve(points, WIDTH, HEIGHT, 8);
  const round = (value: number) => Math.round(value * 10) / 10;
  const grid = curve.gridlines
    .map(
      (line) =>
        `<line x1="0" x2="${WIDTH}" y1="${round(line.y)}" y2="${round(line.y)}" stroke="${ink.line}" stroke-width="1"/>`,
    )
    .join('');
  const line = curve.points.map((point) => `${round(point.x)},${round(point.y)}`).join(' ');
  const dots = curve.points
    .map(
      (point) =>
        `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="3.5" fill="${ink.graphite}" stroke="${ink.sheet}" stroke-width="1.5"/>`,
    )
    .join('');
  return `<svg class="keep" width="${WIDTH}pt" height="${HEIGHT}pt" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Gewichtskurve">${grid}<polyline points="${line}" fill="none" stroke="${ink.graphite}" stroke-width="2" stroke-linejoin="round"/>${dots}</svg>`;
}
