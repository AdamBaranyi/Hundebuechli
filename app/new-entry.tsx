import { useLocalSearchParams } from 'expo-router';
import { z } from '@/domain/zod';

import { HEALTH_KINDS } from '@/domain/health';
import { HealthFormScreen } from '@/features/health/HealthFormScreen';
import { RequireDogs } from '@/features/dogs/RequireDogs';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function NewEntryRoute() {
  const { dogId, kind } = useLocalSearchParams();
  const parsedKind = z.enum(HEALTH_KINDS).safeParse(kind);
  return (
    <RequireDogs>
      <HealthFormScreen
        entryId={null}
        dogId={uuidParam(dogId)}
        kind={parsedKind.success ? parsedKind.data : null}
      />
    </RequireDogs>
  );
}
