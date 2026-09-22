import { Redirect } from 'expo-router';

import { useDogCount } from '@/features/dogs/queries';
import { AppTabs } from '@/ui/AppTabs';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

/** Die drei Bereiche. Ohne Hund beginnt die App mit dem Erststart. */
export default function TabsLayout() {
  const count = useDogCount();
  if (count.isError) throw count.error;
  if (count.isPending) return null;
  if (count.data === 0) return <Redirect href="/welcome" />;
  return <AppTabs />;
}
