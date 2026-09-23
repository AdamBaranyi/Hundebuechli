import Constants from 'expo-constants';
import { View } from 'react-native';

import { common } from '@/content/common';
import { settingsText } from '@/content/settings';
import { AppText } from '@/ui/AppText';
import { Screen } from '@/ui/Screen';
import { SectionTitle } from '@/ui/SectionTitle';
import { Sheet } from '@/ui/Sheet';
import { space } from '@/ui/tokens';

import { ReminderSettings } from './ReminderSettings';

function Block({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ gap: space.s3 }}>
      <SectionTitle>{title}</SectionTitle>
      <Sheet>
        <View style={{ padding: space.s4 }}>
          <AppText>{text}</AppText>
        </View>
      </Sheet>
    </View>
  );
}

/**
 * Einstellungen, Stand Tag 3: Uhrzeit und Vorlauf der Erinnerungen, Hinweis
 * zur Tiermedizin, Datenschutz, Version. Halterangaben, Beispieldaten und
 * «Alle Daten löschen» kommen an Tag 4 dazu.
 */
export function SettingsScreen() {
  return (
    <Screen inTabs>
      <AppText variant="largeTitle" heading={1}>
        {settingsText.title}
      </AppText>
      <ReminderSettings />
      <Block title={settingsText.about} text={common.disclaimer} />
      <Block title={settingsText.privacy} text={settingsText.privacyText} />
      <AppText variant="secondary" color="pencil">
        {settingsText.version(Constants.expoConfig?.version ?? '–')}
      </AppText>
    </Screen>
  );
}
