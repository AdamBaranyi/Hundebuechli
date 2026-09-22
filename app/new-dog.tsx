import { DogFormScreen } from '@/features/dogs/DogFormScreen';

export { RouteError as ErrorBoundary } from '@/ui/RouteError';

export default function NewDogRoute() {
  return <DogFormScreen dogId={null} />;
}
