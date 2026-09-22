import type { HealthKind } from '@/domain/health';
import type { IconName } from '@/ui/icon-shapes';

export const kindIcons: Record<HealthKind, IconName> = {
  vaccination: 'syringe',
  deworming: 'pill',
  parasite_protection: 'shield',
  vet_visit: 'stethoscope',
};
