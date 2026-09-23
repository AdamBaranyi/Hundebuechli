import { useLocalSearchParams } from 'expo-router';

import { DocumentFormScreen } from '@/features/documents/DocumentFormScreen';
import { RequireDogs } from '@/features/dogs/RequireDogs';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function NewDocumentRoute() {
  const { dogId } = useLocalSearchParams();
  return (
    <RequireDogs>
      <DocumentFormScreen documentId={null} dogId={uuidParam(dogId)} />
    </RequireDogs>
  );
}
