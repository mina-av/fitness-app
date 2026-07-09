import { isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '@/db/client';
import { sets } from '@/db/schema';

import { buildHeatmapData, type HeatmapEntry } from '../consistency';
import type { AnalysisSet } from '../types';

/**
 * Heatmap-Daten unabhängig von der Wochen-Navigation in useWeeklyAnalysis —
 * deckt beliebige Monate ab, nicht nur die aktuell gewählte Woche.
 */
export function useHeatmapData(): { heatmap: HeatmapEntry[]; isLoading: boolean } {
  const { data: setRows, updatedAt } = useLiveQuery(
    db.select().from(sets).where(isNull(sets.deletedAt)),
  );

  const heatmap = useMemo(() => {
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
    return buildHeatmapData(analysisSets);
  }, [setRows]);

  return { heatmap, isLoading: updatedAt === undefined };
}
