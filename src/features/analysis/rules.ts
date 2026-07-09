import { getWeekRange } from '@/lib/dates';

import { detectStagnation } from './trends';
import type {
  AnalysisExercise,
  AnalysisSet,
  AnalysisWorkout,
  MuscleGroup,
  Recommendation,
} from './types';
import { volumeByMuscleGroup } from './volume';
import { workoutsPerWeek } from './consistency';

const DEFAULT_TARGET_REPS_MAX = 12;
const OVERLOAD_VOLUME_SPIKE_FACTOR = 1.3;
const UNDERVOLUME_SET_THRESHOLD = 10;
const CONSISTENCY_MIN_WORKOUTS_PER_WEEK = 2;

export interface GenerateRecommendationsInput {
  /** ALLE Sätze (nicht nur die aktuelle Woche) — die Regeln schneiden Wochen intern selbst zu. */
  sets: AnalysisSet[];
  exercises: AnalysisExercise[];
  workouts: AnalysisWorkout[];
  /** exerciseId → oberes Ziel-Rep-Ende aus dem zuletzt verwendeten Template (falls vorhanden). */
  exerciseTargetRepsMax: Map<string, number>;
  weekOffset?: number;
  reference?: Date;
}

export function generateRecommendations(input: GenerateRecommendationsInput): Recommendation[] {
  const {
    sets,
    exercises,
    workouts,
    exerciseTargetRepsMax,
    weekOffset = 0,
    reference = new Date(),
  } = input;

  const { start, end } = getWeekRange(weekOffset, reference);
  const currentWeekSets = sets.filter(
    (s) => !s.isWarmup && s.createdAt >= start && s.createdAt <= end,
  );

  return [
    ...progressionRecommendations(currentWeekSets, exerciseTargetRepsMax),
    ...stagnationRecommendations(sets, reference),
    ...overloadWarnings(sets, exercises, weekOffset, reference),
    ...underVolumeWarnings(sets, exercises, currentWeekSets),
    ...consistencyRecommendation(workouts, weekOffset, reference),
  ];
}

function groupByExerciseId(sets: AnalysisSet[]): Map<string, AnalysisSet[]> {
  const map = new Map<string, AnalysisSet[]>();
  for (const set of sets) {
    const list = map.get(set.exerciseId);
    if (list) list.push(set);
    else map.set(set.exerciseId, [set]);
  }
  return map;
}

/**
 * Regel 1: Alle Arbeitssätze (setType='normal') einer Übung erreichen diese
 * Woche das obere Ziel-Rep-Ende (aus Template, sonst Default 12) bei RIR >= 2
 * → Steigerung um +2,5 kg vorschlagen.
 */
function progressionRecommendations(
  currentWeekSets: AnalysisSet[],
  exerciseTargetRepsMax: Map<string, number>,
): Recommendation[] {
  const byExercise = groupByExerciseId(currentWeekSets.filter((s) => s.setType === 'normal'));
  const results: Recommendation[] = [];

  for (const [exerciseId, exerciseSets] of byExercise) {
    if (exerciseSets.length === 0) continue;
    const targetRepsMax = exerciseTargetRepsMax.get(exerciseId) ?? DEFAULT_TARGET_REPS_MAX;
    const allAtOrAboveTarget = exerciseSets.every(
      (s) => s.reps >= targetRepsMax && s.rir !== null && s.rir >= 2,
    );
    if (allAtOrAboveTarget) {
      results.push({
        type: 'progression',
        severity: 'tipp',
        exerciseId,
        message: `Alle Arbeitssätze erreichen ${targetRepsMax}+ Wiederholungen bei RIR ≥ 2 — Zeit für +2,5 kg.`,
      });
    }
  }

  return results;
}

/** Regel 2: Stagnation >= 3 Wochen (pro Übung) → Deload oder Programmwechsel vorschlagen. */
function stagnationRecommendations(allSets: AnalysisSet[], reference: Date): Recommendation[] {
  const byExercise = groupByExerciseId(allSets);
  const results: Recommendation[] = [];

  for (const [exerciseId, exerciseSets] of byExercise) {
    const { isStagnating } = detectStagnation(exerciseSets, reference);
    if (isStagnating) {
      results.push({
        type: 'stagnation',
        severity: 'warnung',
        exerciseId,
        message:
          'Seit 3+ Wochen kein Fortschritt beim e1RM — Deload (−10 %) oder Programmwechsel erwägen.',
      });
    }
  }

  return results;
}

/**
 * Regel 3: Überlastungs-Warnung pro Muskelgruppe — entweder Wochenvolumen
 * > 30 % über dem Schnitt der letzten 3 Wochen, oder durchgehend RIR 0 in
 * dieser Woche.
 */
function overloadWarnings(
  allSets: AnalysisSet[],
  exercises: AnalysisExercise[],
  weekOffset: number,
  reference: Date,
): Recommendation[] {
  const { start, end } = getWeekRange(weekOffset, reference);
  const currentWeekSets = allSets.filter(
    (s) => !s.isWarmup && s.createdAt >= start && s.createdAt <= end,
  );
  const currentByGroup = volumeByMuscleGroup(currentWeekSets, exercises);

  const priorWeeksVolumes = [1, 2, 3].map((i) => {
    const range = getWeekRange(weekOffset - i, reference);
    const weekSets = allSets.filter(
      (s) => !s.isWarmup && s.createdAt >= range.start && s.createdAt <= range.end,
    );
    return volumeByMuscleGroup(weekSets, exercises);
  });

  const groupsSeen = new Set<MuscleGroup>();
  currentByGroup.forEach((g) => groupsSeen.add(g.muscleGroup));
  priorWeeksVolumes.forEach((week) => week.forEach((g) => groupsSeen.add(g.muscleGroup)));

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const results: Recommendation[] = [];

  for (const muscleGroup of groupsSeen) {
    const currentVolume = currentByGroup.find((g) => g.muscleGroup === muscleGroup)?.volume ?? 0;
    const priorValues = priorWeeksVolumes.map(
      (week) => week.find((g) => g.muscleGroup === muscleGroup)?.volume ?? 0,
    );
    const avgPrior = priorValues.reduce((sum, v) => sum + v, 0) / priorValues.length;
    const volumeSpike = avgPrior > 0 && currentVolume > avgPrior * OVERLOAD_VOLUME_SPIKE_FACTOR;

    const groupSets = currentWeekSets.filter((s) => {
      const exercise = exerciseById.get(s.exerciseId);
      return exercise && exercise.muscleGroup === muscleGroup;
    });
    const allRirZero = groupSets.length > 0 && groupSets.every((s) => s.rir === 0);

    if (volumeSpike || allRirZero) {
      results.push({
        type: 'overload',
        severity: 'warnung',
        muscleGroup,
        message: volumeSpike
          ? `Wochenvolumen für ${muscleGroup} liegt über 30 % über dem Schnitt der letzten 3 Wochen.`
          : `Durchgehend RIR 0 für ${muscleGroup} diese Woche — Überlastungsrisiko.`,
      });
    }
  }

  return results;
}

/**
 * Regel 4: Untervolumen-Warnung — eine Muskelgruppe, die grundsätzlich
 * trainiert wird (irgendwann in der gesamten Historie als primäre
 * Muskelgruppe einer geloggten Übung vorkommt), hat diese Woche weniger als
 * 10 Arbeitssätze (nur direkte/primäre Zuordnung, sekundäre zählen hier nicht mit).
 */
function underVolumeWarnings(
  allSets: AnalysisSet[],
  exercises: AnalysisExercise[],
  currentWeekSets: AnalysisSet[],
): Recommendation[] {
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));

  const trainedGroups = new Set<MuscleGroup>();
  for (const set of allSets) {
    if (set.isWarmup) continue;
    const exercise = exerciseById.get(set.exerciseId);
    if (exercise) trainedGroups.add(exercise.muscleGroup);
  }

  const countThisWeek = new Map<MuscleGroup, number>();
  for (const set of currentWeekSets) {
    const exercise = exerciseById.get(set.exerciseId);
    if (!exercise) continue;
    countThisWeek.set(exercise.muscleGroup, (countThisWeek.get(exercise.muscleGroup) ?? 0) + 1);
  }

  const results: Recommendation[] = [];
  for (const muscleGroup of trainedGroups) {
    const count = countThisWeek.get(muscleGroup) ?? 0;
    if (count < UNDERVOLUME_SET_THRESHOLD) {
      results.push({
        type: 'undervolume',
        severity: 'warnung',
        muscleGroup,
        message: `Nur ${count} Arbeitssätze für ${muscleGroup} diese Woche (< ${UNDERVOLUME_SET_THRESHOLD}).`,
      });
    }
  }

  return results;
}

/** Regel 5: Konsistenz — weniger als 2 Einheiten diese Woche → Hinweis. */
function consistencyRecommendation(
  workouts: AnalysisWorkout[],
  weekOffset: number,
  reference: Date,
): Recommendation[] {
  const count = workoutsPerWeek(workouts, weekOffset, reference);
  if (count < CONSISTENCY_MIN_WORKOUTS_PER_WEEK) {
    return [
      {
        type: 'consistency',
        severity: 'tipp',
        message: `Nur ${count} Einheit(en) diese Woche — für konstanten Fortschritt mind. ${CONSISTENCY_MIN_WORKOUTS_PER_WEEK}/Woche anstreben.`,
      },
    ];
  }
  return [];
}
