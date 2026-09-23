import { Image, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { documentsText } from '@/content/documents';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { usePalette } from '@/ui/theme';
import { space } from '@/ui/tokens';

type Props = { uri: string | null; label: string; onClose: () => void };

/**
 * Eine Seite im Vollbild. Unter iOS vergrössert die ScrollView selbst mit zwei
 * Fingern; unter Android und im Browser bleibt es beim Vollbild (E-60).
 */
export function DocumentViewer({ uri, label, onClose }: Props) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={uri !== null} animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          styles.frame,
          { backgroundColor: palette.pebble, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.bar}>
          <Button label={documentsText.viewer.close} variant="text" onPress={onClose} />
          {Platform.OS === 'ios' ? (
            <AppText variant="secondary" color="pencil">
              {documentsText.viewer.zoomHint}
            </AppText>
          ) : null}
        </View>
        <ScrollView
          style={styles.frame}
          contentContainerStyle={styles.page}
          maximumZoomScale={4}
          minimumZoomScale={1}
          centerContent
        >
          {uri ? (
            <Image
              source={{ uri }}
              accessibilityLabel={label}
              accessibilityRole="image"
              resizeMode="contain"
              style={styles.image}
            />
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.edge,
  },
  page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', aspectRatio: 0.7 },
});
