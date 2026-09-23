import { useLocalSearchParams } from 'expo-router';

import { MedicationListScreen } from '@/features/medications/MedicationListScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function DogMedicationRoute() {
  const { id } = useLocalSearchParams();
  return <MedicationListScreen dogId={uuidParam(id)} />;
}
