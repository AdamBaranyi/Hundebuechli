import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { ICON_SHAPES, type IconName, type IconShape } from './icon-shapes';
import { usePalette } from './theme';
import type { ColorName } from './tokens';

type Props = {
  name: IconName;
  size?: number;
  color?: ColorName;
};

function Shape({ shape }: { shape: IconShape }) {
  switch (shape.kind) {
    case 'path':
      return <Path d={shape.d} />;
    case 'circle':
      return <Circle cx={shape.cx} cy={shape.cy} r={shape.r} />;
    case 'rect':
      return (
        <Rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx}
          transform={shape.transform}
        />
      );
  }
}

/** Die Formen eines Symbols im 24er-Raster; Strich und Farbe setzt das Umfeld. */
export function IconShapes({ name }: { name: IconName }) {
  return (
    <>
      {ICON_SHAPES[name].map((shape, index) => (
        <Shape key={index} shape={shape} />
      ))}
    </>
  );
}

/** Ein Symbol ist immer Schmuck neben Text; vorgelesen wird der Text. */
export function Icon({ name, size = 24, color = 'graphite' }: Props) {
  const palette = usePalette();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={palette[color]}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <IconShapes name={name} />
    </Svg>
  );
}
