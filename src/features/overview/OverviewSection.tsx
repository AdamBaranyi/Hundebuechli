import { View } from 'react-native';

import { formatLocal } from '@/content/format';
import { overviewText } from '@/content/overview';
import type { LocalDate } from '@/domain/local-date';
import { Row } from '@/ui/Row';
import { SectionTitle } from '@/ui/SectionTitle';
import { Sheet } from '@/ui/Sheet';
import { StampField } from '@/ui/StampField';
import { space } from '@/ui/tokens';

import type { OverviewRow, OverviewSection as Section } from './overview-model';

type Props = {
  section: Section;
  today: LocalDate;
  /** Zeilen, die in dieser Sitzung gestempelt wurden: bleiben an ihrem Platz. */
  stamped: ReadonlySet<string>;
  onStamp: (row: OverviewRow) => void;
  onUndo: (row: OverviewRow) => void;
};

/** Ein Abschnitt von «Als Nächstes»: Titel und ein Blatt mit Zeilen und Stempelfeldern. */
export function OverviewSection({ section, today, stamped, onStamp, onUndo }: Props) {
  return (
    <View style={{ gap: space.s3 }}>
      <SectionTitle due={section.bucket === 'overdue'}>{section.title}</SectionTitle>
      <Sheet>
        {section.rows.map((row) => {
          const done = stamped.has(row.id);
          return (
            <Row
              key={row.id}
              icon={row.icon}
              title={row.title}
              secondary={row.secondary}
              status={done ? { text: overviewText.doneOn(formatLocal.stamp(today)) } : row.status}
              trailing={
                <StampField
                  id={row.id}
                  state={done ? 'done' : row.status.due ? 'due' : 'open'}
                  stampText={formatLocal.stamp(today)}
                  label={
                    done
                      ? overviewText.stamped(row.title, row.dogName, formatLocal.dayMonth(today))
                      : overviewText.stamp(row.title, row.dogName)
                  }
                  onPress={() => (done ? onUndo(row) : onStamp(row))}
                />
              }
            />
          );
        })}
      </Sheet>
    </View>
  );
}
