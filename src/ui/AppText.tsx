import { Text, type TextProps } from 'react-native';

import { usePalette } from './theme';
import { type ColorName, fontFamily, type FontWeight, typeScale, type TypeVariant } from './tokens';

type Props = TextProps & {
  variant?: TypeVariant;
  weight?: FontWeight;
  color?: ColorName;
  /** Macht den Text zur Überschrift dieser Stufe, für VoiceOver und im Web. */
  heading?: 1 | 2 | 3;
};

/**
 * Jeder Text der App. Die Systemschriftgrösse wirkt (allowFontScaling bleibt
 * an); Layouts brechen um, statt zu kürzen.
 */
export function AppText({
  variant = 'body',
  weight,
  color = 'graphite',
  heading,
  style,
  ...rest
}: Props) {
  const palette = usePalette();
  const step = typeScale[variant];
  // react-native-web macht aus role="heading" mit aria-level ein <h1> bis <h3>.
  // Die Typen von React Native kennen aria-level nicht, darum als Zusatz.
  const headingProps = heading ? { role: 'heading' as const, ...{ 'aria-level': heading } } : {};
  return (
    <Text
      {...rest}
      {...headingProps}
      style={[
        {
          fontFamily: fontFamily[weight ?? step.weight],
          fontSize: step.fontSize,
          lineHeight: step.lineHeight,
          color: palette[color],
        },
        style,
      ]}
    />
  );
}
