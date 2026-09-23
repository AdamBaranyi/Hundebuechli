import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { IconShapes } from './Icon';
import { useReducedMotion } from './reduced-motion';
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

/** Der Stempel setzt sich, ohne Nachfedern – ein Stempel federt nicht. */
const SETTLE = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * Der eine bewegte Moment der App: Beim Stempeln kommt der Stempel leicht
 * grösser und gedreht herein und setzt sich, 200 ms, dazu die Haptik «Erfolg».
 * Mit «Bewegung reduzieren» blendet er nur in 150 ms ein; die Haptik bleibt.
 */
function useStampMotion(state: StampState) {
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(1));
  const previous = useRef(state);
  useEffect(() => {
    const entering = previous.current !== 'done' && state === 'done';
    previous.current = state;
    if (!entering) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 150 : 200,
      easing: SETTLE,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [progress, reduced, state]);
  const style = reduced
    ? { opacity: progress }
    : {
        opacity: progress,
        transform: [
          { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] }) },
          {
            rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '0deg'] }),
          },
        ],
      };
  // Vor dem Tipp auf null: So beginnt der Stempel unsichtbar, sobald er erscheint.
  return { style, prepare: () => progress.setValue(0) };
}

/**
 * Das Stempelfeld: offen gestrichelt mit Stempel-Zeichen, fällig in Karmin,
 * erledigt ein Graphit-Stempel mit Datum. Der Zustand steht zusätzlich im
 * Text der Zeile – nie nur über Farbe.
 */
export function StampField({ id, state, label, stampText, onPress }: Props) {
  const palette = usePalette();
  const motion = useStampMotion(state);
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={() => {
        if (state !== 'done') motion.prepare();
        onPress();
      }}
      style={({ pressed }) => [
        styles.field,
        { transform: [{ scale: pressed ? 0.94 : 1 }], opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Animated.View style={state === 'done' ? motion.style : undefined}>
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
                // Fünf Zeichen wie «18:05» wären breiter als der innere Ring: dann enger gesetzt.
                textLength={(stampText ?? '').length >= 5 ? 34 : undefined}
                lengthAdjust="spacingAndGlyphs"
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
      </Animated.View>
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
