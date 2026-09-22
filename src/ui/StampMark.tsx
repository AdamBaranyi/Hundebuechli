import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, Text as SvgText, TextPath } from 'react-native-svg';

import { usePalette } from './theme';
import { fontFamily } from './tokens';

type Props = {
  /** Tag und Monat im Stempel, etwa «22.9.». */
  dayMonth: string;
  year: string;
  /** Vollständiger Satz für VoiceOver. */
  label: string;
  size?: number;
};

/**
 * Die Marke: ein runder Doppelring in Karmin, oben «Hundebüechli», in der
 * Mitte der heutige Tag – der Erststart stempelt den Tag, an dem es beginnt.
 */
export function StampMark({ dayMonth, year, label, size = 168 }: Props) {
  const palette = usePalette();
  const color = palette.carmine;
  return (
    <View accessible role="img" accessibilityLabel={label} style={styles.mark}>
      <Svg width={size} height={size} viewBox="0 0 168 168" aria-hidden>
        <Defs>
          <Path id="stamp-arc" d="M26 84a58 58 0 0 1 116 0" />
        </Defs>
        <Circle cx={84} cy={84} r={80} fill="none" stroke={color} strokeWidth={5} />
        <Circle cx={84} cy={84} r={71} fill="none" stroke={color} strokeWidth={1.5} />
        <SvgText fill={color} fontSize={17} fontFamily={fontFamily.extraBold} letterSpacing={2.5}>
          <TextPath href="#stamp-arc" startOffset="50%" textAnchor="middle">
            HUNDEBÜECHLI
          </TextPath>
        </SvgText>
        <Circle cx={22} cy={100} r={2.5} fill={color} />
        <Circle cx={146} cy={100} r={2.5} fill={color} />
        <SvgText
          x={84}
          y={108}
          fill={color}
          fontSize={40}
          fontFamily={fontFamily.extraBold}
          textAnchor="middle"
        >
          {dayMonth}
        </SvgText>
        <SvgText
          x={84}
          y={132}
          fill={color}
          fontSize={17}
          fontFamily={fontFamily.extraBold}
          textAnchor="middle"
          letterSpacing={1}
        >
          {year}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignSelf: 'flex-start', transform: [{ rotate: '-6deg' }] },
});
