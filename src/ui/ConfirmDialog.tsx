import { Modal, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { usePalette } from './theme';
import { radius, space } from './tokens';

type Props = {
  visible: boolean;
  title: string;
  /** Nennt, was verschwindet. */
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Rückfrage vor dem Löschen: nennt, was verschwindet, und sagt, dass es sich
 * nicht rückgängig machen lässt. Ohne Einblendung – der einzige bewegte
 * Moment der App ist der Stempel.
 */
export function ConfirmDialog(props: Props) {
  const palette = usePalette();
  return (
    <Modal visible={props.visible} transparent animationType="none" onRequestClose={props.onCancel}>
      <View style={styles.overlay}>
        <View
          role="alertdialog"
          aria-modal
          accessibilityViewIsModal
          accessibilityLabel={props.title}
          style={[styles.sheet, { backgroundColor: palette.sheet }]}
        >
          <AppText variant="subtitle" heading={2}>
            {props.title}
          </AppText>
          <AppText>{props.text}</AppText>
          <View style={styles.buttons}>
            <Button label={props.confirmLabel} onPress={props.onConfirm} />
            <Button label={props.cancelLabel} variant="secondary" onPress={props.onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: space.edge,
    backgroundColor: 'rgba(29, 36, 32, 0.45)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: space.s4,
    padding: space.s5,
    borderRadius: radius.sheet,
  },
  buttons: { gap: space.s2 },
});
