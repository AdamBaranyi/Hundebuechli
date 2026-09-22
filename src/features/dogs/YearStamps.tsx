import { Pressable, StyleSheet, View } from 'react-native';

import { dogsText } from '@/content/dogs';
import { formatLocal } from '@/content/format';
import { healthKinds } from '@/content/health';
import type { HealthEntry } from '@/db/repositories/health';
import { HEALTH_KINDS } from '@/domain/health';
import type { LocalDate } from '@/domain/local-date';
import { type MonthMark, yearInStamps } from '@/domain/year-stamps';
import { AppText } from '@/ui/AppText';
import { Sheet } from '@/ui/Sheet';
import { usePalette } from '@/ui/theme';
import { space } from '@/ui/tokens';

type Props = { entries: readonly HealthEntry[]; today: LocalDate; onOpen: () => void };

function Dot({ mark }: { mark: MonthMark }) {
  const palette = usePalette();
  if (!mark) return <View style={[styles.small, { backgroundColor: palette.line }]} />;
  if (mark === 'done') return <View style={[styles.big, { backgroundColor: palette.graphite }]} />;
  const color = mark === 'overdue' ? palette.carmine : palette.pencil;
  return <View style={[styles.big, styles.dashed, { borderColor: color }]} />;
}

/** «nächste am 25.9.» im laufenden Jahr, sonst «nächste im April 2027». */
function nextText(due: LocalDate, today: LocalDate, overdue: boolean): string {
  if (overdue) return dogsText.profile.overdueSince(formatLocal.stamp(due));
  if (due.slice(0, 4) === today.slice(0, 4))
    return dogsText.profile.nextDue(formatLocal.stamp(due));
  return dogsText.profile.nextDueLater(formatLocal.monthYear(due));
}

/**
 * «Das Jahr in Stempeln»: je Art eine Reihe über zwölf Monate. Voller Punkt
 * erledigt, gestrichelter Ring fällig, Karmin überfällig. VoiceOver liest je
 * Reihe einen Satz statt zwölf Punkte.
 */
export function YearStamps({ entries, today, onOpen }: Props) {
  const kinds = HEALTH_KINDS.filter((kind) => entries.some((entry) => entry.kind === kind));
  const rows = yearInStamps(entries, kinds, today);
  const months = rows[0]?.months.map((month) => month.month) ?? [];
  const monthName = (month: string) => formatLocal.monthYear(`${month}-01`).split(' ')[0] ?? month;

  return (
    <Sheet dividerInset={0}>
      {rows.map((row) => {
        const open = entries.find(
          (entry) => entry.kind === row.kind && entry.nextDueDate && !entry.completedByEntryId,
        );
        const overdue = open?.nextDueDate ? open.nextDueDate < today : false;
        const next = open?.nextDueDate ? nextText(open.nextDueDate, today, overdue) : null;
        const done = row.months.filter((m) => m.mark === 'done').map((m) => monthName(m.month));
        return (
          <Pressable
            key={row.kind}
            role="button"
            accessibilityLabel={dogsText.profile.yearRow(healthKinds[row.kind], done, next)}
            onPress={onOpen}
            style={styles.row}
          >
            <View style={styles.head}>
              <AppText weight="bold">{healthKinds[row.kind]}</AppText>
              {next ? (
                <AppText
                  variant="secondary"
                  weight={overdue ? 'bold' : 'regular'}
                  color={overdue ? 'carmine' : 'pencil'}
                >
                  {next}
                </AppText>
              ) : null}
            </View>
            <View style={styles.dots} aria-hidden>
              {row.months.map((month) => (
                <View key={month.month} style={styles.cell}>
                  <Dot mark={month.mark} />
                </View>
              ))}
            </View>
          </Pressable>
        );
      })}
      <View style={styles.footer} aria-hidden>
        <View style={styles.dots}>
          {months.map((month) => (
            <View key={month} style={styles.cell}>
              <AppText variant="secondary" color="pencil">
                {formatLocal.monthInitial(month)}
              </AppText>
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          {(['done', 'due', 'overdue'] as const).map((mark) => (
            <View key={mark} style={styles.legendItem}>
              <Dot mark={mark} />
              <AppText variant="secondary" color="pencil">
                {dogsText.profile.legend[mark]}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.s2, paddingVertical: space.s3, paddingHorizontal: space.s4, minHeight: 64 },
  head: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: space.s1 },
  dots: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 20 },
  small: { width: 5, height: 5, borderRadius: 3 },
  big: { width: 16, height: 16, borderRadius: 8 },
  dashed: { borderWidth: 2, borderStyle: 'dashed' },
  footer: { gap: space.s3, paddingHorizontal: space.s4, paddingBottom: space.s4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, columnGap: space.s5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
});
