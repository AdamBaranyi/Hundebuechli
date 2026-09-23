import { useLocalSearchParams } from 'expo-router';

import { DiaryScreen } from '@/features/diary/DiaryScreen';
import { uuidParam } from '@/ui/route-params';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function DogDiaryRoute() {
  const { id } = useLocalSearchParams();
  return <DiaryScreen dogId={uuidParam(id)} />;
}
