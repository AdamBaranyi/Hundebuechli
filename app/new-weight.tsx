import { useLocalSearchParams } from 'expo-router';

import { RequireDogs } from '@/features/dogs/RequireDogs';
import { WeightFormScreen } from '@/features/weights/WeightFormScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function NewWeightRoute() {
  const { dogId } = useLocalSearchParams();
  return (
    <RequireDogs>
      <WeightFormScreen dogId={uuidParam(dogId)} />
    </RequireDogs>
  );
}
