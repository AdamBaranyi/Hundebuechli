import { useLocalSearchParams } from 'expo-router';

import { DocumentsScreen } from '@/features/documents/DocumentsScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function DogDocumentsRoute() {
  const { id } = useLocalSearchParams();
  return <DocumentsScreen dogId={uuidParam(id)} />;
}
