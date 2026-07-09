import { getWeekRange } from '@/lib/dates';

import type { AnalysisExercise, AnalysisSet, MuscleGroup } from './types';

export interface VolumeByExercise {
  exerciseId: string;
  volume: number;
}

export interface VolumeByMuscleGroup {
  muscleGroup: MuscleGroup;
  volume: number;
}

export interface WeeklyVolumeReport {
  total: number;
  byExercise: VolumeByExercise[];
  byMuscleGroup: VolumeByMuscleGroup[];
}

/** Volumen eines einzelnen Satzes (reps × kg). Warmup-Sätze werden von den Aggregations-Funktionen ausgeschlossen. */
export function setVolume(set: AnalysisSet): number {
  return set.reps * set.weightKg;
}

export function totalVolume(sets: AnalysisSet[]): number {
  return sets.filter((s) => !s.isWarmup).reduce((sum, s) => sum + setVolume(s), 0);
}

export function volumeByExercise(sets: AnalysisSet[]): VolumeByExercise[] {
  const volumeByExerciseId = new Map<string, number>();
  for (const set of sets) {
    if (set.isWarmup) continue;
    volumeByExerciseId.set(
      set.exerciseId,
      (volumeByExerciseId.get(set.exerciseId) ?? 0) + setVolume(set),
    );
  }
  return Array.from(volumeByExerciseId.entries()).map(([exerciseId, volume]) => ({
    exerciseId,
    volume,
  }));
}

/**
 * Volumen pro Muskelgruppe. Sekundäre Muskelgruppen einer Übung zählen mit
 * Faktor 0,5 (z.B. Trizeps bei Bankdrücken), primäre mit vollem Gewicht.
 */
export function volumeByMuscleGroup(
  sets: AnalysisSet[],
  exercises: AnalysisExercise[],
): VolumeByMuscleGroup[] {
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const volumeByGroup = new Map<MuscleGroup, number>();
  const add = (group: MuscleGroup, amount: number) => {
    volumeByGroup.set(group, (volumeByGroup.get(group) ?? 0) + amount);
  };

  for (const set of sets) {
    if (set.isWarmup) continue;
    const exercise = exerciseById.get(set.exerciseId);
    if (!exercise) continue;
    const volume = setVolume(set);
    add(exercise.muscleGroup, volume);
    for (const secondary of exercise.secondaryMuscles) {
      add(secondary, volume * 0.5);
    }
  }

  return Array.from(volumeByGroup.entries()).map(([muscleGroup, volume]) => ({
    muscleGroup,
    volume,
  }));
}

export function filterSetsInRange(sets: AnalysisSet[], start: Date, end: Date): AnalysisSet[] {
  return sets.filter((s) => s.createdAt >= start && s.createdAt <= end);
}

/** Wochenvolumen-Report (gesamt, pro Übung, pro Muskelgruppe) für eine Woche relativ zu `reference`. */
export function weeklyVolumeReport(
  sets: AnalysisSet[],
  exercises: AnalysisExercise[],
  weekOffset = 0,
  reference: Date = new Date(),
): WeeklyVolumeReport {
  const { start, end } = getWeekRange(weekOffset, reference);
  const weekSets = filterSetsInRange(sets, start, end);
  return {
    total: totalVolume(weekSets),
    byExercise: volumeByExercise(weekSets),
    byMuscleGroup: volumeByMuscleGroup(weekSets, exercises),
  };
}
