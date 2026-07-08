import type { MuscleGroup } from '@/db/schema';

import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from './constants';

export function formatMuscleGroup(value: MuscleGroup): string {
  return MUSCLE_GROUPS.find((g) => g.value === value)?.label ?? value;
}

export function formatEquipment(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return EQUIPMENT_OPTIONS.find((e) => e.value === value)?.label ?? value;
}

export function formatWeightKg(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return `${rounded.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kg`;
}
