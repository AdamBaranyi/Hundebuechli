import { useLocalSearchParams } from 'expo-router';

import { DogFormScreen } from '@/features/dogs/DogFormScreen';
import { RequireDogs } from '@/features/dogs/RequireDogs';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function EditDogRoute() {
  const { id } = useLocalSearchParams();
  const dogId = uuidParam(id);
  // Eine kaputte ID darf nie zu «Neuer Hund» werden: dann bleibt es beim Hinweis.
  return (
    <RequireDogs>
      <DogFormScreen dogId={dogId ?? '00000000-0000-4000-8000-000000000000'} />
    </RequireDogs>
  );
}
