import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

import { db } from '@/db/client';
import type { Exercise } from '@/db/schema';

import {
  archiveExercise as archiveExerciseRepo,
  createExercise as createExerciseRepo,
  exerciseByIdQuery,
  exercisesQuery,
  restoreExercise as restoreExerciseRepo,
  updateExercise as updateExerciseRepo,
  type ExerciseFilters,
  type ExerciseInput,
  type ExercisePatch,
} from './repository';

export function useExercises(filters: ExerciseFilters = {}) {
  const { data, error, updatedAt } = useLiveQuery(exercisesQuery(db, filters), [
    filters.search,
    filters.muscleGroup,
    filters.equipmentContext,
  ]);

  return { exercises: (data ?? []) as Exercise[], isLoading: updatedAt === undefined, error };
}

export function useExercise(id: string | undefined) {
  const { data, error, updatedAt } = useLiveQuery(exerciseByIdQuery(db, id ?? '__none__'), [id]);

  return {
    exercise: (data?.[0] as Exercise | undefined) ?? undefined,
    isLoading: updatedAt === undefined,
    error,
  };
}

export function useExerciseActions() {
  const createExercise = useCallback((input: ExerciseInput) => createExerciseRepo(db, input), []);
  const updateExercise = useCallback(
    (id: string, patch: ExercisePatch) => updateExerciseRepo(db, id, patch),
    [],
  );
  const archiveExercise = useCallback((id: string) => archiveExerciseRepo(db, id), []);
  const restoreExercise = useCallback((id: string) => restoreExerciseRepo(db, id), []);

  return { createExercise, updateExercise, archiveExercise, restoreExercise };
}
