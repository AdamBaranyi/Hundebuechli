import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { Screen } from './Screen';
import { space } from './tokens';

type Props = {
  title: string;
  cancelLabel: string;
  onCancel: () => void;
  saveLabel: string;
  onSave: () => void;
  saving?: boolean;
  /** Fehler beim Sichern, als Satz über dem Knopf. */
  saveError?: string | null;
  children: ReactNode;
};

/** Blatt von unten: «Abbrechen» links, Titel in der Mitte, «Sichern» am Schluss. */
export function FormScreen(props: Props) {
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.side}>
          <Button label={props.cancelLabel} variant="text" onPress={props.onCancel} />
        </View>
        <AppText weight="bold" heading={1} style={styles.title}>
          {props.title}
        </AppText>
        <View style={styles.side} />
      </View>
      {props.children}
      <View style={styles.footer}>
        {props.saveError ? (
          <AppText variant="secondary" weight="bold" color="carmine" role="alert">
            {props.saveError}
          </AppText>
        ) : null}
        <Button label={props.saveLabel} onPress={props.onSave} disabled={props.saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  side: { flex: 1, alignItems: 'flex-start' },
  title: { flex: 2, textAlign: 'center' },
  footer: { gap: space.s3 },
});
