// Eigene, DB-unabhängige Typen für die Analyse-Schicht. Bewusst NICHT aus
// `src/db/schema.ts` importiert, damit `src/features/analysis/` wirklich
// keine Abhängigkeit auf `src/db` hat (später serverseitig wiederverwendbar).

export type SetType = 'normal' | 'dropset' | 'restpause';
export type MuscleGroup = 'brust' | 'beine' | 'ruecken' | 'schultern' | 'arme' | 'core';

export interface AnalysisSet {
  id: string;
  exerciseId: string;
  workoutId: string;
  reps: number;
  weightKg: number;
  rir: number | null;
  setType: SetType;
  isWarmup: boolean;
  createdAt: Date;
}

export interface AnalysisExercise {
  id: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
}

export interface AnalysisWorkout {
  id: string;
  date: Date;
  finishedAt: Date | null;
}

export type RecommendationSeverity = 'tipp' | 'warnung';

export interface Recommendation {
  type: string;
  severity: RecommendationSeverity;
  exerciseId?: string;
  muscleGroup?: MuscleGroup;
  message: string;
}

export interface WeekVolumePoint {
  weekOffset: number;
  volume: number;
}

export interface WeeklyReport {
  weekOffset: number;
  totalVolume: number;
  volumeByMuscleGroup: { muscleGroup: MuscleGroup; volume: number }[];
  workoutsCount: number;
  recommendations: Recommendation[];
  heatmap: { dateKey: string; volume: number }[];
  comparisonToPreviousWeek: {
    currentVolume: number;
    previousVolume: number;
    volumeChangePercent: number | null;
  };
  /** Sätze dieser Woche, die zum Zeitpunkt ihres Loggings ein PR waren. */
  newPRs: AnalysisSet[];
  /** Wochenvolumen der letzten 8 Wochen, endend bei `weekOffset` (chronologisch aufsteigend). */
  last8WeeksVolume: WeekVolumePoint[];
}
