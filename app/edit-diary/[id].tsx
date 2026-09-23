import { useLocalSearchParams } from 'expo-router';

import { DiaryFormScreen } from '@/features/diary/DiaryFormScreen';
import { RequireDogs } from '@/features/dogs/RequireDogs';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function EditDiaryRoute() {
  const { id } = useLocalSearchParams();
  return (
    <RequireDogs>
      <DiaryFormScreen
        entryId={uuidParam(id) ?? '00000000-0000-4000-8000-000000000000'}
        dogId={null}
      />
    </RequireDogs>
  );
}
