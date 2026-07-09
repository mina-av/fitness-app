import { useMemo } from 'react';

import type { Exercise, SetType, WorkoutSet } from '@/db/schema';
import { formatLastTimeSummary } from '@/lib/format';

import { useExerciseWorkoutHistory } from '../hooks/useWorkouts';
import { ExerciseLogCard, type ExerciseTarget } from './ExerciseLogCard';
import type { SetEntryValues } from './SetEntryForm';

export interface ExerciseLogCardContainerProps {
  exercise: Exercise;
  workoutId: string;
  currentSets: WorkoutSet[];
  target?: ExerciseTarget;
  supersetPartnerNames?: string[];
  isNewPR: (
    set: Pick<WorkoutSet, 'exerciseId' | 'reps' | 'weightKg' | 'isWarmup' | 'setType'>,
  ) => boolean;
  onAddSet: (exerciseId: string, values: SetEntryValues, setType: SetType) => Promise<void>;
  onUpdateSet: (id: string, values: SetEntryValues) => Promise<void>;
  onRemoveSet: (id: string) => Promise<void>;
  onLinkSuperset?: () => void;
}

/**
 * Bindet ExerciseLogCard an Daten: lädt die Übungshistorie selbst (bleibt
 * innerhalb des workouts-Features — kein Import aus dem exercises-Feature),
 * filtert das laufende Workout heraus und berechnet die "Letztes Mal"-Zeile.
 */
export function ExerciseLogCardContainer({
  exercise,
  workoutId,
  currentSets,
  target,
  supersetPartnerNames,
  isNewPR,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onLinkSuperset,
}: ExerciseLogCardContainerProps) {
  const { rows } = useExerciseWorkoutHistory(exercise.id);

  const lastTimeSummary = useMemo(() => {
    const previousWorkoutSets = rows.filter(
      (row) => row.workout.id !== workoutId && !row.set.isWarmup,
    );
    if (previousWorkoutSets.length === 0) return undefined;
    const lastWorkoutId = previousWorkoutSets[previousWorkoutSets.length - 1].workout.id;
    const lastSets = previousWorkoutSets
      .filter((row) => row.workout.id === lastWorkoutId)
      .map((row) => row.set);
    return formatLastTimeSummary(lastSets);
  }, [rows, workoutId]);

  return (
    <ExerciseLogCard
      exercise={exercise}
      sets={currentSets}
      lastTimeSummary={lastTimeSummary}
      target={target}
      supersetPartnerNames={supersetPartnerNames}
      isNewPR={isNewPR}
      onAddSet={(values, setType) => onAddSet(exercise.id, values, setType)}
      onUpdateSet={onUpdateSet}
      onRemoveSet={onRemoveSet}
      onLinkSuperset={onLinkSuperset}
    />
  );
}
