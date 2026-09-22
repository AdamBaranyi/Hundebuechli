import { Redirect } from 'expo-router';

import { useDogCount } from '@/features/dogs/queries';
import { WelcomeScreen } from '@/features/welcome/WelcomeScreen';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

/** Erststart, solange kein Hund eingetragen ist. */
export default function WelcomeRoute() {
  const count = useDogCount();
  if (count.isPending) return null;
  if (count.data && count.data > 0) return <Redirect href="/" />;
  return <WelcomeScreen />;
}
