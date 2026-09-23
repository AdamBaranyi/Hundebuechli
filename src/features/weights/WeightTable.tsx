import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatLocal } from '@/content/format';
import { weightsText } from '@/content/weights';
import type { WeightRow } from '@/db/repositories/weights';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Icon } from '@/ui/Icon';
import { Sheet } from '@/ui/Sheet';
import { usePalette } from '@/ui/theme';
import { space, touch } from '@/ui/tokens';

import { useDeleteWeight } from './queries';

/** Die Veränderung mit Vorzeichen; ohne Vorgänger bleibt die Spalte leer. */
function difference(grams: number | null): string {
  if (grams === null) return '–';
  if (grams === 0) return '±0';
  return `${grams > 0 ? '+' : '−'}${formatLocal.kilograms(Math.abs(grams))}`;
}

/** Die Tabelle als Gegenstück zur Kurve: Datum, Gewicht, Veränderung. */
export function WeightTable({ rows }: { rows: readonly WeightRow[] }) {
  const palette = usePalette();
  const remove = useDeleteWeight();
  const [confirming, setConfirming] = useState<WeightRow | null>(null);
  const newestFirst = [...rows].reverse();

  function confirmDelete() {
    const row = confirming;
    setConfirming(null);
    if (!row) return;
    remove.mutate(row.id, { onSuccess: () => announce(weightsText.removed) });
  }

  return (
    <>
      <Sheet>
        <View style={[styles.row, styles.head, { borderBottomColor: palette.line }]}>
          <AppText variant="secondary" weight="bold" color="pencil" style={styles.date}>
            {weightsText.table.date}
          </AppText>
          <AppText variant="secondary" weight="bold" color="pencil" style={styles.number}>
            {weightsText.table.weight}
          </AppText>
          <AppText variant="secondary" weight="bold" color="pencil" style={styles.number}>
            {weightsText.table.difference}
          </AppText>
          <View style={styles.action} />
        </View>
        {newestFirst.map((row) => (
          <View key={row.id} style={styles.row}>
            <AppText style={styles.date}>{formatLocal.long(row.date)}</AppText>
            <AppText weight="bold" style={styles.number}>
              {formatLocal.kilograms(row.grams)}
            </AppText>
            <AppText color="pencil" style={styles.number}>
              {difference(row.differenceGrams)}
            </AppText>
            <Pressable
              role="button"
              accessibilityLabel={weightsText.removeLabel(
                formatLocal.long(row.date),
                formatLocal.kilograms(row.grams),
              )}
              onPress={() => setConfirming(row)}
              style={({ pressed }) => [
                styles.action,
                { backgroundColor: pressed ? palette.pressed : 'transparent' },
              ]}
            >
              <Icon name="trash" size={22} color="pencil" />
            </Pressable>
          </View>
        ))}
      </Sheet>
      <ConfirmDialog
        visible={confirming !== null}
        title={weightsText.removeTitle}
        text={weightsText.removeText}
        confirmLabel={weightsText.remove}
        cancelLabel={weightsText.cancel}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    minHeight: touch.min,
    paddingHorizontal: space.s4,
    paddingVertical: space.s2,
  },
  head: { borderBottomWidth: 1 },
  date: { flex: 2, minWidth: 0 },
  number: { flex: 1, textAlign: 'right' },
  action: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
});
