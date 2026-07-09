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

/** "Letztes Mal: 3×8 @ 80 kg" — bei identischen Sätzen kompakt, sonst der schwerste Satz. */
export function formatLastTimeSummary(
  sets: { reps: number; weightKg: number }[],
): string | undefined {
  if (sets.length === 0) return undefined;
  const [first] = sets;
  const allSame = sets.every((s) => s.reps === first.reps && s.weightKg === first.weightKg);
  if (allSame) {
    return `${sets.length}×${first.reps} @ ${formatWeightKg(first.weightKg)}`;
  }
  const heaviest = [...sets].sort((a, b) => b.weightKg - a.weightKg)[0];
  return `${formatWeightKg(heaviest.weightKg)} × ${heaviest.reps}`;
}
