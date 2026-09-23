import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { settingsText } from '@/content/settings';
import { useDb } from '@/db/DatabaseProvider';
import { deleteEverything } from '@/db/repositories/everything';
import { photoStore } from '@/files/photo-store';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { SectionTitle } from '@/ui/SectionTitle';
import { space } from '@/ui/tokens';

const t = settingsText.wipe;

/** Löscht alles samt Dateien; der Abgleich räumt danach die Erinnerungen weg. */
function useWipe() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { attachmentPaths } = deleteEverything(db);
      await Promise.all(attachmentPaths.map((path) => photoStore.remove(path)));
    },
    onSuccess: () => client.resetQueries(),
  });
}

/**
 * «Alle Daten löschen»: steht als letztes in den Einstellungen und fragt nach.
 * Danach beginnt die App wieder mit dem Erststart.
 */
export function WipeSettings() {
  const wipe = useWipe();
  const [confirming, setConfirming] = useState(false);

  function confirm() {
    setConfirming(false);
    wipe.mutate(undefined, {
      onSuccess: () => {
        announce(t.done);
        router.replace('/welcome');
      },
    });
  }

  return (
    <View style={{ gap: space.s3 }}>
      <SectionTitle>{t.title}</SectionTitle>
      <AppText color="pencil">{t.hint}</AppText>
      <Button label={t.button} variant="text" onPress={() => setConfirming(true)} />
      <ConfirmDialog
        visible={confirming}
        title={t.confirmTitle}
        text={t.confirmText}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onConfirm={confirm}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}
