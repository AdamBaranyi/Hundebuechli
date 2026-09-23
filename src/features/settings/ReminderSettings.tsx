import { useState } from 'react';
import { Platform, View } from 'react-native';

import { formatLocal } from '@/content/format';
import { notificationsText } from '@/content/notifications';
import { settingsText } from '@/content/settings';
import { parseTime } from '@/features/medications/medication-form';
import { AppText } from '@/ui/AppText';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { Notice } from '@/ui/Notice';
import { SectionTitle } from '@/ui/SectionTitle';
import { TextField } from '@/ui/TextField';
import { space } from '@/ui/tokens';

import { useSaveSettings, useSettings } from './queries';

const LEAD_CHOICES = [0, 1, 3, 7, 14] as const;
type Lead = (typeof LEAD_CHOICES)[number];

/**
 * Uhrzeit und Vorlauf der Terminerinnerungen. Beides wirkt sofort: Der
 * Abgleich plant die Benachrichtigungen nach jeder Änderung neu.
 */
export function ReminderSettings() {
  const settings = useSettings();
  const save = useSaveSettings();
  const [timeText, setTimeText] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  if (!settings.data) return null;

  const minute = settings.data.reminderMinute;
  const lead = String(settings.data.defaultLeadDays);

  function commitTime(text: string) {
    const parsed = parseTime(text);
    if (parsed === null) {
      setProblem(settingsText.reminderTimeError);
      return;
    }
    setProblem(null);
    setTimeText(null);
    save.mutate({ reminderMinute: parsed });
  }

  return (
    <View style={{ gap: space.s3 }}>
      <SectionTitle>{settingsText.reminders}</SectionTitle>
      {Platform.OS === 'web' ? <Notice text={notificationsText.permission.webNotice} /> : null}
      <TextField
        label={settingsText.reminderTime}
        hint={settingsText.reminderTimeHint}
        inputMode="numeric"
        keyboardType="numbers-and-punctuation"
        value={timeText ?? formatLocal.time(minute)}
        onChangeText={(value) => {
          setTimeText(value);
          setProblem(null);
        }}
        onEndEditing={() => commitTime(timeText ?? formatLocal.time(minute))}
        error={problem}
      />
      <View style={{ gap: space.s2 }}>
        <AppText variant="secondary" weight="medium" color="pencil">
          {settingsText.lead}
        </AppText>
        <ChoiceChips
          label={settingsText.lead}
          choices={LEAD_CHOICES.map((days) => ({
            value: String(days),
            label: settingsText.leadChoices[days],
          }))}
          selected={lead}
          onSelect={(value) => save.mutate({ defaultLeadDays: Number(value) as Lead })}
        />
      </View>
    </View>
  );
}
