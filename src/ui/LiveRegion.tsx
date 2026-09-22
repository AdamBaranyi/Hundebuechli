import { Platform, StyleSheet, Text } from 'react-native';

import { useAnnouncement } from './announce';

/** Unsichtbarer Live-Bereich für Ansagen im Browser; auf dem Gerät nicht nötig. */
export function LiveRegion() {
  const text = useAnnouncement();
  if (Platform.OS !== 'web') return null;
  return (
    <Text aria-live="polite" style={styles.hidden}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    left: -10000,
    fontSize: 16,
  },
});
