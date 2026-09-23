import { useLocalSearchParams } from 'expo-router';

import { WeightScreen } from '@/features/weights/WeightScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function DogWeightRoute() {
  const { id } = useLocalSearchParams();
  return <WeightScreen dogId={uuidParam(id)} />;
}
