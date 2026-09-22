import { useLocalSearchParams } from 'expo-router';

import { HealthListScreen } from '@/features/health/HealthListScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function DogHealthRoute() {
  const { id } = useLocalSearchParams();
  return <HealthListScreen dogId={uuidParam(id)} />;
}
