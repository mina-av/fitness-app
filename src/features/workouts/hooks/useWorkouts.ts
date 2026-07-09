import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

import { db } from '@/db/client';
import type { Workout, WorkoutSet } from '@/db/schema';

import {
  activeWorkoutQuery,
  addSet as addSetRepo,
  exerciseHistoryQuery,
  finishWorkout as finishWorkoutRepo,
  removeSet as removeSetRepo,
  setsForWorkoutQuery,
  startWorkout as startWorkoutRepo,
  updateSet as updateSetRepo,
  workoutByIdQuery,
  workoutsQuery,
  type AddSetInput,
  type SetPatch,
  type StartWorkoutInput,
} from './repository';

export function useWorkouts() {
  const { data, updatedAt, error } = useLiveQuery(workoutsQuery(db));
  return { workouts: (data ?? []) as Workout[], isLoading: updatedAt === undefined, error };
}

export function useWorkout(id: string | undefined) {
  const { data, updatedAt, error } = useLiveQuery(workoutByIdQuery(db, id ?? '__none__'), [id]);
  return {
    workout: (data?.[0] as Workout | undefined) ?? undefined,
    isLoading: updatedAt === undefined,
    error,
  };
}

/** Für den Fortsetzen-Flow: ein Workout-Kill beendet das Workout NICHT. */
export function useActiveWorkout() {
  const { data, updatedAt, error } = useLiveQuery(activeWorkoutQuery(db));
  return {
    activeWorkout: (data?.[0] as Workout | undefined) ?? undefined,
    isLoading: updatedAt === undefined,
    error,
  };
}

export function useWorkoutSets(workoutId: string | undefined) {
  const { data, updatedAt, error } = useLiveQuery(
    setsForWorkoutQuery(db, workoutId ?? '__none__'),
    [workoutId],
  );
  return { sets: (data ?? []) as WorkoutSet[], isLoading: updatedAt === undefined, error };
}

/** Rohe Verlaufszeilen (Satz + Workout) einer Übung — für "Letztes Mal"-Anzeigen beim Logging. */
export function useExerciseWorkoutHistory(exerciseId: string | undefined) {
  const { data, updatedAt, error } = useLiveQuery(
    exerciseHistoryQuery(db, exerciseId ?? '__none__'),
    [exerciseId],
  );
  return {
    rows: (data ?? []) as { set: WorkoutSet; workout: Workout }[],
    isLoading: updatedAt === undefined,
    error,
  };
}

export function useWorkoutActions() {
  const startWorkout = useCallback((input?: StartWorkoutInput) => startWorkoutRepo(db, input), []);
  const finishWorkout = useCallback((id: string) => finishWorkoutRepo(db, id), []);
  const addSet = useCallback((input: AddSetInput) => addSetRepo(db, input), []);
  const updateSet = useCallback((id: string, patch: SetPatch) => updateSetRepo(db, id, patch), []);
  const removeSet = useCallback((id: string) => removeSetRepo(db, id), []);

  return { startWorkout, finishWorkout, addSet, updateSet, removeSet };
}
