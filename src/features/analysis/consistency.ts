import { formatDateKey, getWeekRange } from '@/lib/dates';

import type { AnalysisSet, AnalysisWorkout } from './types';

export interface HeatmapEntry {
  dateKey: string;
  volume: number;
}

/** Trainingsvolumen pro Tag (Datum → Volumen) für die Kalender-Heatmap. Warmups ausgeschlossen. */
export function buildHeatmapData(sets: AnalysisSet[]): HeatmapEntry[] {
  const volumeByDate = new Map<string, number>();
  for (const set of sets) {
    if (set.isWarmup) continue;
    const key = formatDateKey(set.createdAt);
    volumeByDate.set(key, (volumeByDate.get(key) ?? 0) + set.reps * set.weightKg);
  }
  return Array.from(volumeByDate.entries()).map(([dateKey, volume]) => ({ dateKey, volume }));
}

/** Anzahl abgeschlossener Workouts in einer Woche relativ zu `reference`. */
export function workoutsPerWeek(
  workouts: AnalysisWorkout[],
  weekOffset = 0,
  reference: Date = new Date(),
): number {
  const { start, end } = getWeekRange(weekOffset, reference);
  return workouts.filter((w) => w.finishedAt !== null && w.date >= start && w.date <= end).length;
}

/**
 * Anzahl aufeinanderfolgender Wochen (rückwärts ab `reference`) mit
 * mindestens einem abgeschlossenen Workout. Bricht bei der ersten
 * trainingsfreien Woche ab.
 */
export function currentStreakWeeks(
  workouts: AnalysisWorkout[],
  reference: Date = new Date(),
): number {
  let streak = 0;
  let offset = 0;
  while (workoutsPerWeek(workouts, offset, reference) > 0) {
    streak += 1;
    offset -= 1;
  }
  return streak;
}
