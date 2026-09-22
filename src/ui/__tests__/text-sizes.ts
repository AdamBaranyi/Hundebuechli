import { StyleSheet } from 'react-native';
import type { TestInstance } from 'test-renderer';

/**
 * Alle Texte eines gerenderten Baums mit ihrer Schriftgrösse. Für die Regel
 * «Schrift ab 16 pt» in Komponententests.
 */
export function textSizes(root: TestInstance): { text: string; fontSize: number | undefined }[] {
  return root
    .queryAll((node) => node.type === 'Text')
    .map((node) => {
      const style = StyleSheet.flatten(node.props.style as never) as
        { fontSize?: number } | undefined;
      const children: unknown = node.props.children;
      return { text: String(children), fontSize: style?.fontSize };
    });
}
