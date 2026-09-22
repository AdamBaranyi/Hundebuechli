import { useLocalSearchParams } from 'expo-router';

import { HealthFormScreen } from '@/features/health/HealthFormScreen';
import { RequireDogs } from '@/features/dogs/RequireDogs';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function EditEntryRoute() {
  const { id } = useLocalSearchParams();
  return (
    <RequireDogs>
      <HealthFormScreen
        entryId={uuidParam(id) ?? '00000000-0000-4000-8000-000000000000'}
        dogId={null}
        kind={null}
      />
    </RequireDogs>
  );
}
