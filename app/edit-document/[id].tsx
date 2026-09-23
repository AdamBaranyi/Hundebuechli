import { useLocalSearchParams } from 'expo-router';

import { DocumentFormScreen } from '@/features/documents/DocumentFormScreen';
import { RequireDogs } from '@/features/dogs/RequireDogs';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function EditDocumentRoute() {
  const { id } = useLocalSearchParams();
  return (
    <RequireDogs>
      <DocumentFormScreen
        documentId={uuidParam(id) ?? '00000000-0000-4000-8000-000000000000'}
        dogId={null}
      />
    </RequireDogs>
  );
}
