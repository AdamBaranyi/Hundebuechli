import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { IconShapes } from './Icon';
import { stampAngle } from './stamp-angle';
import { usePalette } from './theme';
import { fontFamily, touch } from './tokens';

export type StampState = 'open' | 'due' | 'done';

type Props = {
  /** ID des Eintrags; bestimmt den festen Winkel des Stempels. */
  id: string;
  state: StampState;
  /** Was ein Tipp tut, als ganzer Satz für VoiceOver. */
  label: string;
  /** Datum oder Uhrzeit im Stempel, etwa «22.9.» oder «08:04». */
  stampText?: string;
  onPress: () => void;
};

/**
 * Das Stempelfeld: offen gestrichelt mit Stempel-Zeichen, fällig in Karmin,
 * erledigt ein Graphit-Stempel mit Datum. Der Zustand steht zusätzlich im
 * Text der Zeile – nie nur über Farbe. Die Bewegung des Stempels folgt an
 * Tag 4 (Gestaltung, Durchgang 2).
 */
export function StampField({ id, state, label, stampText, onPress }: Props) {
  const palette = usePalette();
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.field, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Svg width={touch.stamp} height={touch.stamp} viewBox="0 0 56 56" aria-hidden>
        {state === 'done' ? (
          <G rotation={stampAngle(id)} origin="28, 28">
            <Circle
              cx={28}
              cy={28}
              r={25}
              fill="none"
              stroke={palette.graphite}
              strokeWidth={2.5}
            />
            <Circle
              cx={28}
              cy={28}
              r={20.5}
              fill="none"
              stroke={palette.graphite}
              strokeWidth={1.2}
            />
            <SvgText
              x={28}
              y={33.5}
              textAnchor="middle"
              fontSize={16}
              fontFamily={fontFamily.extraBold}
              fill={palette.graphite}
            >
              {stampText ?? ''}
            </SvgText>
          </G>
        ) : (
          <OpenRing color={state === 'due' ? palette.carmine : palette.pencil} />
        )}
      </Svg>
    </Pressable>
  );
}

/** Offenes Feld: gestrichelter Ring, darin klein das Stempel-Zeichen. */
function OpenRing({ color }: { color: string }) {
  return (
    <>
      <Circle
        cx={28}
        cy={28}
        r={22}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      <G
        transform="translate(17 17) scale(0.9167)"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <IconShapes name="stamp" />
      </G>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    width: touch.stamp,
    height: touch.stamp,
    borderRadius: touch.stamp / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
