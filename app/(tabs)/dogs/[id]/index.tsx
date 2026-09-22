import { useLocalSearchParams } from 'expo-router';

import { DogProfileScreen } from '@/features/dogs/DogProfileScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function DogRoute() {
  const { id } = useLocalSearchParams();
  return <DogProfileScreen dogId={uuidParam(id)} />;
}
