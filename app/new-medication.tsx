import { useLocalSearchParams } from 'expo-router';

import { RequireDogs } from '@/features/dogs/RequireDogs';
import { MedicationFormScreen } from '@/features/medications/MedicationFormScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function NewMedicationRoute() {
  const { dogId } = useLocalSearchParams();
  return (
    <RequireDogs>
      <MedicationFormScreen medicationId={null} dogId={uuidParam(dogId)} />
    </RequireDogs>
  );
}
