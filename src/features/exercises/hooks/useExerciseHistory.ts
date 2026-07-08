import { and, asc, eq, isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '@/db/client';
import { sets, workouts, type Workout, type WorkoutSet } from '@/db/schema';

/**
 * Historie einer Übung, chronologisch. Direkter Zugriff auf `sets`/`workouts`
 * aus dem gemeinsamen `src/db/schema` (kein Import aus dem workouts-Feature —
 * Invariante: kein Feature importiert aus einem anderen Feature).
 */
function exerciseHistoryQuery(exerciseId: string) {
  return db
    .select({ set: sets, workout: workouts })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(and(eq(sets.exerciseId, exerciseId), isNull(sets.deletedAt), isNull(workouts.deletedAt)))
    .orderBy(asc(sets.createdAt));
}

export interface ExerciseHistoryGroup {
  workout: Workout;
  sets: WorkoutSet[];
}

export function useExerciseHistory(exerciseId: string | undefined) {
  const { data, updatedAt, error } = useLiveQuery(exerciseHistoryQuery(exerciseId ?? '__none__'), [
    exerciseId,
  ]);

  const groups = useMemo<ExerciseHistoryGroup[]>(() => {
    const rows = (data ?? []) as { set: WorkoutSet; workout: Workout }[];
    const byWorkout = new Map<string, ExerciseHistoryGroup>();
    for (const row of rows) {
      const existing = byWorkout.get(row.workout.id);
      if (existing) {
        existing.sets.push(row.set);
      } else {
        byWorkout.set(row.workout.id, { workout: row.workout, sets: [row.set] });
      }
    }
    return Array.from(byWorkout.values());
  }, [data]);

  return { history: groups, isLoading: updatedAt === undefined, error };
}
