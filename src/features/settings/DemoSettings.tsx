import { View } from 'react-native';

import { demoText } from '@/content/demo';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { SectionTitle } from '@/ui/SectionTitle';
import { toast } from '@/ui/toast';
import { space } from '@/ui/tokens';

import { useLoadDemo, useRemoveDemo } from '../demo/queries';
import { useSettings } from './queries';

function tell(text: string) {
  toast(text);
  announce(text);
}

/** Beispieldaten laden oder entfernen; eigene Hunde bleiben beim Entfernen. */
export function DemoSettings() {
  const settings = useSettings();
  const load = useLoadDemo();
  const remove = useRemoveDemo();
  const loaded = settings.data?.demoLoaded ?? false;
  return (
    <View style={{ gap: space.s3 }}>
      <SectionTitle>{demoText.settingsTitle}</SectionTitle>
      <AppText color="pencil">{loaded ? demoText.settingsLoaded : demoText.settingsEmpty}</AppText>
      {loaded ? (
        <Button
          label={demoText.remove}
          variant="secondary"
          disabled={remove.isPending}
          onPress={() => remove.mutate(undefined, { onSuccess: () => tell(demoText.removed) })}
        />
      ) : (
        <Button
          label={load.isPending ? demoText.loading : demoText.load}
          variant="secondary"
          disabled={load.isPending}
          onPress={() => load.mutate(undefined, { onSuccess: () => tell(demoText.loaded) })}
        />
      )}
    </View>
  );
}
