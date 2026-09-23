import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { formatLocal } from '@/content/format';
import { weightsText } from '@/content/weights';
import { buildCurve, type WeightPoint } from '@/domain/weight';
import { usePalette } from '@/ui/theme';
import { fontFamily, typeScale } from '@/ui/tokens';

type Props = { points: readonly WeightPoint[]; dogName: string };

const HEIGHT = 200;

/**
 * Die Kurve nach dem Entwurf: eine Linie in Graphit, Punkte mit Ring in der
 * Blattfarbe, drei Haarlinien als Gitter, keine Legende – es gibt nur eine
 * Reihe. Beschriftet ist der letzte Wert. Für VoiceOver ist das Bild ein Satz;
 * die Zahlen stehen in der Tabelle daneben.
 */
export function WeightChart({ points, dogName }: Props) {
  const palette = usePalette();
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  if (points.length === 0) return null;
  const curve = buildCurve(points, Math.max(width, 1), HEIGHT);
  const last = curve.points.at(-1);
  return (
    <View
      style={styles.frame}
      onLayout={onLayout}
      // Ohne «accessible» liest VoiceOver die Kurve nicht als ein Bild.
      accessible
      role="img"
      accessibilityLabel={weightsText.chartLabel(dogName, points.length)}
    >
      {width > 0 ? (
        <Svg width={width} height={HEIGHT} aria-hidden>
          {curve.gridlines.map((line) => (
            <Line
              key={line.y}
              x1={0}
              x2={width}
              y1={line.y}
              y2={line.y}
              stroke={palette.line}
              strokeWidth={1}
            />
          ))}
          <Polyline
            points={curve.points.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke={palette.graphite}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {curve.points.map((point) => (
            <Circle
              key={point.point.date}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={palette.graphite}
              stroke={palette.sheet}
              strokeWidth={2}
            />
          ))}
          {last ? (
            <SvgText
              x={Math.min(last.x, width - 4)}
              y={Math.max(last.y - 12, 16)}
              textAnchor="end"
              fill={palette.graphite}
              fontFamily={fontFamily.bold}
              fontSize={typeScale.secondary.fontSize}
            >
              {formatLocal.kilograms(last.point.grams)}
            </SvgText>
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', height: HEIGHT },
});
