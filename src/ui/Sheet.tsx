import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { usePalette } from './theme';
import { radius } from './tokens';

type Props = {
  children: ReactNode;
  /** Einzug der Trennlinie von links; 52 fluchtet mit dem Text neben dem Symbol. */
  dividerInset?: number;
};

/** Ein Blatt mit Zeilen. Keine Schatten: Tiefe entsteht durch Kiesel unter Blatt. */
export function Sheet({ children, dividerInset = 52 }: Props) {
  const palette = usePalette();
  const items = Children.toArray(children);
  return (
    <View style={[styles.sheet, { backgroundColor: palette.sheet }]}>
      {items.map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <View
              style={[styles.divider, { marginLeft: dividerInset, backgroundColor: palette.line }]}
            />
          ) : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { borderRadius: radius.sheet, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginRight: 0, minHeight: 1 },
});
