import { AppText } from './AppText';

type Props = { children: string; due?: boolean };

/** Zwischentitel eines Abschnitts, «Überfällig» in Karmin. Satzschreibung, keine Versalien. */
export function SectionTitle({ children, due = false }: Props) {
  return (
    <AppText variant="subtitle" heading={2} color={due ? 'carmine' : 'graphite'}>
      {children}
    </AppText>
  );
}
