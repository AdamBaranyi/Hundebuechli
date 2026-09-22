import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import type { IconName } from './icon-shapes';
import { usePalette } from './theme';
import { space } from './tokens';

type Props = {
  title: string;
  /** Hund und Einzelheiten in Nebentext, etwa «Bäri, Milbemax». */
  secondary?: string;
  /** Zustand als Text; fällig in Karmin und mit Zeichen, nie nur über Farbe. */
  status?: { text: string; due?: boolean };
  icon?: IconName;
  /** Uhrzeit links statt Symbol, für den Fahrplan der Medikamente. */
  time?: string;
  /** Rechts, etwa ein Stempelfeld. */
  trailing?: ReactNode;
  /** Macht die ganze Zeile zur Tippfläche mit Pfeil zur Detailansicht. */
  onPress?: () => void;
};

/** Eine Zeile auf einem Blatt: Mindesthöhe 64, mit Stempelfeld 72. */
export function Row({ title, secondary, status, icon, time, trailing, onPress }: Props) {
  const palette = usePalette();
  const body = (
    <>
      {time ? (
        <AppText variant="subtitle" style={styles.time}>
          {time}
        </AppText>
      ) : icon ? (
        <View style={styles.icon}>
          <Icon name={icon} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText weight="bold">{title}</AppText>
        {secondary ? (
          <AppText variant="secondary" color="pencil">
            {secondary}
          </AppText>
        ) : null}
        {status ? <Status {...status} /> : null}
      </View>
      {trailing}
      {onPress ? <Icon name="chevronRight" size={20} color="pencil" /> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, trailing ? styles.withStamp : null]}>{body}</View>;
  }
  return (
    <Pressable
      role="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? { backgroundColor: palette.pressed } : null]}
    >
      {body}
    </Pressable>
  );
}

function Status({ text, due = false }: { text: string; due?: boolean }) {
  if (!due) {
    return (
      <AppText variant="secondary" color="pencil">
        {text}
      </AppText>
    );
  }
  return (
    <View style={styles.due}>
      <Icon name="alert" size={18} color="carmine" />
      <AppText variant="secondary" weight="bold" color="carmine" style={styles.dueText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: 64,
    paddingVertical: space.s3,
    paddingHorizontal: space.s4,
  },
  withStamp: { minHeight: 72 },
  icon: { alignSelf: 'flex-start', marginTop: 2 },
  time: { width: 56, alignSelf: 'flex-start', fontVariant: ['tabular-nums'] },
  text: { flex: 1, minWidth: 0 },
  due: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dueText: { flexShrink: 1 },
});
