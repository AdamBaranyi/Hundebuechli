import { useColorScheme } from 'react-native';

import { colors, type ColorScheme, type Palette } from './tokens';

/** Hell zuerst; dunkel, wenn das System es verlangt. */
export function useColorSchemeName(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

export function usePalette(): Palette {
  return colors[useColorSchemeName()];
}
