import { useLocalSearchParams } from 'expo-router';

import { RequireDogs } from '@/features/dogs/RequireDogs';
import { MedicationFormScreen } from '@/features/medications/MedicationFormScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function EditMedicationRoute() {
  const { id } = useLocalSearchParams();
  return (
    <RequireDogs>
      <MedicationFormScreen
        medicationId={uuidParam(id) ?? '00000000-0000-4000-8000-000000000000'}
        dogId={null}
      />
    </RequireDogs>
  );
}
