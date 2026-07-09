import { getWeekRange } from '@/lib/dates';

import { epley1RM } from './oneRepMax';
import { totalVolume } from './volume';
import type { AnalysisSet } from './types';

export interface WeekComparison {
  currentVolume: number;
  previousVolume: number;
  /** null = keine Vergleichsdaten (z.B. erste Nutzungswoche). */
  volumeChangePercent: number | null;
}

/** Aktuelle Woche (relativ zu `weekOffset`) vs. die davor. */
export function compareWeeks(
  sets: AnalysisSet[],
  weekOffset = 0,
  reference: Date = new Date(),
): WeekComparison {
  const current = getWeekRange(weekOffset, reference);
  const previous = getWeekRange(weekOffset - 1, reference);

  const currentSets = sets.filter(
    (s) => s.createdAt >= current.start && s.createdAt <= current.end,
  );
  const previousSets = sets.filter(
    (s) => s.createdAt >= previous.start && s.createdAt <= previous.end,
  );

  const currentVolume = totalVolume(currentSets);
  const previousVolume = totalVolume(previousSets);

  return {
    currentVolume,
    previousVolume,
    volumeChangePercent:
      previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : null,
  };
}

interface WeeklyBestEffort {
  e1RM: number;
  rir: number | null;
}

function weeklyBestEffort(
  exerciseSets: AnalysisSet[],
  weekOffset: number,
  reference: Date,
): WeeklyBestEffort | undefined {
  const { start, end } = getWeekRange(weekOffset, reference);
  const weekSets = exerciseSets.filter(
    (s) => !s.isWarmup && s.setType === 'normal' && s.createdAt >= start && s.createdAt <= end,
  );
  if (weekSets.length === 0) return undefined;

  let best: AnalysisSet = weekSets[0];
  let bestE1RM = epley1RM(best.weightKg, best.reps);
  for (const set of weekSets.slice(1)) {
    const e1rm = epley1RM(set.weightKg, set.reps);
    if (e1rm > bestE1RM) {
      bestE1RM = e1rm;
      best = set;
    }
  }
  return { e1RM: bestE1RM, rir: best.rir };
}

function isImprovement(latest: WeeklyBestEffort, previous: WeeklyBestEffort): boolean {
  if (latest.e1RM > previous.e1RM) return true;
  // Gleiches e1RM (gleiches Gewicht x Reps), aber weniger RIR verbraucht = mehr
  // Kraftreserve genutzt → gilt als Fortschritt, nicht als Stagnation.
  if (latest.e1RM === previous.e1RM && latest.rir !== null && previous.rir !== null) {
    return latest.rir < previous.rir;
  }
  return false;
}

export interface StagnationResult {
  isStagnating: boolean;
  weeksWithoutImprovement: number;
}

/**
 * Stagnation: das beste e1RM der aktuellen (mit Daten belegten) Woche
 * übertrifft nicht die beste der letzten `thresholdWeeks` (Standard 3)
 * Wochen MIT Trainingsdaten für diese Übung. Wochen ohne Sätze für die
 * Übung (leer / nur Warmups) werden übersprungen, nicht als "keine
 * Verbesserung" gezählt. Bei zu wenig Historie (< thresholdWeeks+1 Wochen
 * mit Daten, z.B. erste Nutzungswochen) wird nicht auf Stagnation erkannt.
 */
export function detectStagnation(
  exerciseSets: AnalysisSet[],
  reference: Date = new Date(),
  thresholdWeeks = 3,
): StagnationResult {
  const weeklyBests: WeeklyBestEffort[] = [];
  let offset = 0;
  const MAX_WEEKS_BACK = 52;
  for (let i = 0; i < MAX_WEEKS_BACK && weeklyBests.length <= thresholdWeeks; i++) {
    const week = weeklyBestEffort(exerciseSets, offset, reference);
    if (week) weeklyBests.push(week);
    offset -= 1;
  }

  if (weeklyBests.length <= thresholdWeeks) {
    return { isStagnating: false, weeksWithoutImprovement: 0 };
  }

  const [latest, ...priorWeeks] = weeklyBests;
  const relevantPrior = priorWeeks.slice(0, thresholdWeeks);
  const bestPrior = relevantPrior.reduce((best, week) => (week.e1RM > best.e1RM ? week : best));

  const improved = isImprovement(latest, bestPrior);
  return { isStagnating: !improved, weeksWithoutImprovement: improved ? 0 : relevantPrior.length };
}
