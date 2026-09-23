import { formatLocal } from '@/content/format';
import { medicationsText } from '@/content/medications';
import type { DoseSlot } from '@/db/repositories/medications';
import { minuteOf } from '@/domain/local-time';
import { Row } from '@/ui/Row';
import { StampField } from '@/ui/StampField';

type Props = {
  slots: readonly DoseSlot[];
  /** Jetzt, als Minute des Tages: Was ansteht, ist fällig. */
  nowMinute: number;
  onGive: (slot: DoseSlot) => void;
  onUndo: (slot: DoseSlot) => void;
};

/**
 * Der Fahrplan des Tages: Uhrzeit links, Name und Dosis, rechts das
 * Stempelfeld. Gegebene Gaben bleiben an ihrem Platz und tragen die Uhrzeit
 * im Stempel.
 */
export function DoseRows({ slots, nowMinute, onGive, onUndo }: Props) {
  return (
    <>
      {slots.map((slot) => {
        const given = slot.givenAt !== null;
        const time = formatLocal.time(slot.minute);
        const givenTime = slot.givenAt ? formatLocal.time(minuteOf(slot.givenAt)) : '';
        return (
          <Row
            key={slot.scheduledAt + slot.medicationId}
            time={time}
            title={slot.name}
            secondary={`${slot.dogName}, ${slot.dose}`}
            status={given ? { text: medicationsText.givenAt(givenTime) } : undefined}
            trailing={
              <StampField
                id={slot.medicationId}
                state={given ? 'done' : slot.minute <= nowMinute ? 'due' : 'open'}
                stampText={given ? givenTime : undefined}
                label={
                  given
                    ? medicationsText.givenLabel(slot.name, slot.dogName, givenTime)
                    : medicationsText.give(slot.name, slot.dogName, time)
                }
                onPress={() => (given ? onUndo(slot) : onGive(slot))}
              />
            }
          />
        );
      })}
    </>
  );
}
