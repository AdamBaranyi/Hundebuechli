import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { usePalette } from './theme';
import { radius, space } from './tokens';

type Props = { text: string };

/** Ruhiger Hinweis mit gestrichelter Kante, etwa «Beispieldaten» oder «Vorschau». */
export function Notice({ text }: Props) {
  const palette = usePalette();
  return (
    <View role="note" style={[styles.notice, { borderColor: palette.fieldBorder }]}>
      <Icon name="info" size={22} />
      <AppText variant="secondary" color="pencil" style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    paddingVertical: space.s3,
    paddingHorizontal: space.s4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.field,
  },
  text: { flex: 1 },
});
