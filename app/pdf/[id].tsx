import { useLocalSearchParams } from 'expo-router';

import { RequireDogs } from '@/features/dogs/RequireDogs';
import { PdfScreen } from '@/features/pdf/PdfScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

const KINDS = ['vet', 'sitter', 'poster'] as const;

export default function PdfRoute() {
  const { id, kind } = useLocalSearchParams();
  const dogId = uuidParam(id) ?? '00000000-0000-4000-8000-000000000000';
  const initialKind = KINDS.find((value) => value === kind) ?? 'vet';
  return (
    <RequireDogs>
      <PdfScreen dogId={dogId} initialKind={initialKind} />
    </RequireDogs>
  );
}
