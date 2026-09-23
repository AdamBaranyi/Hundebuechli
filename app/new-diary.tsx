import { useLocalSearchParams } from 'expo-router';

import { DiaryFormScreen } from '@/features/diary/DiaryFormScreen';
import { RequireDogs } from '@/features/dogs/RequireDogs';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function NewDiaryRoute() {
  const { dogId } = useLocalSearchParams();
  return (
    <RequireDogs>
      <DiaryFormScreen entryId={null} dogId={uuidParam(dogId)} />
    </RequireDogs>
  );
}
