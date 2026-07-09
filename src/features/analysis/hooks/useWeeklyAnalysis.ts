import { isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '@/db/client';
import { exercises, sets, templateExercises, workouts } from '@/db/schema';
import { getWeekRange } from '@/lib/dates';

import { buildHeatmapData, workoutsPerWeek } from '../consistency';
import { generateRecommendations } from '../rules';
import { compareWeeks } from '../trends';
import type {
  AnalysisExercise,
  AnalysisSet,
  AnalysisWorkout,
  MuscleGroup,
  WeeklyReport,
} from '../types';
import { totalVolume, volumeByMuscleGroup } from '../volume';

function parseSecondaryMuscles(raw: string | null): MuscleGroup[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Lädt Sätze/Workouts/Übungen/Template-Zielwerte aus der DB (einzige Stelle
 * in `src/features/analysis/`, die das darf — die eigentlichen Berechnungen
 * in volume.ts/trends.ts/rules.ts/etc. bleiben reine Funktionen ohne DB-Import),
 * wandelt sie in die DB-unabhängigen Analyse-Typen um und liefert den
 * fertigen WeeklyReport für eine Woche relativ zu heute.
 */
export function useWeeklyAnalysis(weekOffset = 0): WeeklyReport {
  const { data: setRows } = useLiveQuery(db.select().from(sets).where(isNull(sets.deletedAt)));
  const { data: workoutRows } = useLiveQuery(
    db.select().from(workouts).where(isNull(workouts.deletedAt)),
  );
  const { data: exerciseRows } = useLiveQuery(
    db.select().from(exercises).where(isNull(exercises.deletedAt)),
  );
  const { data: templateExerciseRows } = useLiveQuery(
    db.select().from(templateExercises).where(isNull(templateExercises.deletedAt)),
  );

  return useMemo(() => {
    const reference = new Date();

    const analysisSets: AnalysisSet[] = (setRows ?? []).map((s) => ({
      id: s.id,
      exerciseId: s.exerciseId,
      workoutId: s.workoutId,
      reps: s.reps,
      weightKg: s.weightKg,
      rir: s.rir,
      setType: s.setType,
      isWarmup: s.isWarmup,
      createdAt: s.createdAt,
    }));

    const analysisExercises: AnalysisExercise[] = (exerciseRows ?? []).map((e) => ({
      id: e.id,
      muscleGroup: e.muscleGroup,
      secondaryMuscles: parseSecondaryMuscles(e.secondaryMuscles),
    }));

    const analysisWorkouts: AnalysisWorkout[] = (workoutRows ?? []).map((w) => ({
      id: w.id,
      date: w.date,
      finishedAt: w.finishedAt,
    }));

    // Zielwerte über alle Templates hinweg (nicht nur das zuletzt genutzte) —
    // bei mehreren Zuordnungen gewinnt der zuerst gefundene Wert. Ausreichend
    // für die Steigerungs-Regel, die nur einen groben Richtwert braucht.
    const exerciseTargetRepsMax = new Map<string, number>();
    (templateExerciseRows ?? []).forEach((row) => {
      if (row.targetRepsMax !== null && !exerciseTargetRepsMax.has(row.exerciseId)) {
        exerciseTargetRepsMax.set(row.exerciseId, row.targetRepsMax);
      }
    });

    const recommendations = generateRecommendations({
      sets: analysisSets,
      exercises: analysisExercises,
      workouts: analysisWorkouts,
      exerciseTargetRepsMax,
      weekOffset,
      reference,
    });

    const { start, end } = getWeekRange(weekOffset, reference);
    const currentWeekSets = analysisSets.filter(
      (s) => !s.isWarmup && s.createdAt >= start && s.createdAt <= end,
    );

    return {
      weekOffset,
      totalVolume: totalVolume(currentWeekSets),
      volumeByMuscleGroup: volumeByMuscleGroup(currentWeekSets, analysisExercises),
      workoutsCount: workoutsPerWeek(analysisWorkouts, weekOffset, reference),
      recommendations,
      heatmap: buildHeatmapData(analysisSets),
      comparisonToPreviousWeek: compareWeeks(analysisSets, weekOffset, reference),
    };
  }, [setRows, workoutRows, exerciseRows, templateExerciseRows, weekOffset]);
}
